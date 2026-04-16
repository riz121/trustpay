import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { transaction_id, reason, proof_url } = await req.json();
  if (!transaction_id) return Response.json({ error: 'transaction_id is required' }, { status: 400 });
  if (!reason || reason.trim().length < 10) {
    return Response.json({ error: 'Please provide a reason for the dispute (minimum 10 characters)' }, { status: 400 });
  }

  const results = await base44.asServiceRole.entities.EscrowTransaction.filter({ id: transaction_id });
  const tx = results[0];

  if (!tx) return Response.json({ error: 'Transaction not found' }, { status: 404 });

  const isSender = tx.sender_email === user.email.toLowerCase();
  const isReceiver = tx.receiver_email === user.email.toLowerCase();

  if (!isSender && !isReceiver) {
    return Response.json({ error: 'You are not a party to this transaction' }, { status: 403 });
  }

  const terminal = ['released', 'cancelled', 'disputed'];
  if (terminal.includes(tx.status)) {
    return Response.json({ error: `Transaction cannot be disputed — it is already ${tx.status}` }, { status: 400 });
  }

  const disputerName = isSender ? tx.sender_name : tx.receiver_name;
  const otherEmail = isSender ? tx.receiver_email : tx.sender_email;
  const otherName = isSender ? tx.receiver_name : tx.sender_name;

  const proofNote = proof_url ? `\nProof: ${proof_url}` : '';
  const updated = await base44.asServiceRole.entities.EscrowTransaction.update(tx.id, {
    status: 'disputed',
    notes: `${tx.notes || ''}\n\nDISPUTE raised by ${disputerName || user.email}: ${reason}${proofNote}`.trim(),
  });

  // Send emails (best-effort — receiver may not be an app user)
  try {
    await base44.integrations.Core.SendEmail({
      to: otherEmail,
      subject: `Dispute Raised: ${tx.title}`,
      body: `Hi ${otherName || ''},\n\n${disputerName || user.email} has raised a dispute on the escrow "${tx.title}" (AED ${tx.amount?.toLocaleString()}).\n\nReason: ${reason}\n\nFunds are frozen pending review. Our mediation team will review the case and respond within 3 business days.\n\nEscrow Pay · UAE`,
    });
  } catch (e) {
    console.warn('Could not email other party:', e.message);
  }

  try {
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Dispute Submitted: ${tx.title}`,
      body: `Hi ${disputerName || ''},\n\nYour dispute for "${tx.title}" (AED ${tx.amount?.toLocaleString()}) has been submitted.\n\nReason: ${reason}\n\nOur mediation team will review your case within 3 business days. Funds remain frozen in escrow during this period.\n\nEscrow Pay · UAE`,
    });
  } catch (e) {
    console.warn('Could not email disputer:', e.message);
  }

  try {
    await base44.integrations.Core.SendEmail({
      to: 'support@escrowpay.ae',
      subject: `[DISPUTE] ${tx.title} — AED ${tx.amount}`,
      body: `A dispute has been raised.\n\nTransaction ID: ${tx.id}\nTitle: ${tx.title}\nAmount: AED ${tx.amount}\nSender: ${tx.sender_name} (${tx.sender_email})\nReceiver: ${tx.receiver_name} (${tx.receiver_email})\nDisputed by: ${disputerName} (${user.email})\n\nReason: ${reason}${proof_url ? `\nProof: ${proof_url}` : ''}\n\nPlease review within 3 business days.`,
    });
  } catch (e) {
    console.warn('Could not email support:', e.message);
  }

  return Response.json({ success: true, transaction: updated });
});