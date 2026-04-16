import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { transaction_id, reason } = await req.json();
  if (!transaction_id) return Response.json({ error: 'transaction_id is required' }, { status: 400 });

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
    return Response.json({ error: `Transaction cannot be cancelled — it is already ${tx.status}` }, { status: 400 });
  }

  // Only the sender can cancel once the transaction is funded (before any confirmation)
  if (!isSender && (tx.sender_confirmed || tx.receiver_confirmed)) {
    return Response.json({ error: 'Only the sender can cancel after a confirmation has been made' }, { status: 403 });
  }

  const updated = await base44.asServiceRole.entities.EscrowTransaction.update(tx.id, {
    status: 'cancelled',
    notes: reason ? `${tx.notes || ''}\n\nCancellation reason: ${reason}`.trim() : tx.notes,
  });

  // Notify both parties
  const cancellerName = isSender ? tx.sender_name : tx.receiver_name;
  const otherEmail = isSender ? tx.receiver_email : tx.sender_email;
  const otherName = isSender ? tx.receiver_name : tx.sender_name;

  try {
    await base44.integrations.Core.SendEmail({
      to: otherEmail,
      subject: `Escrow Cancelled: ${tx.title}`,
      body: `Hi ${otherName || ''},\n\nThe escrow transaction "${tx.title}" (AED ${tx.amount?.toLocaleString()}) has been cancelled by ${cancellerName || user.email}.\n\n${reason ? 'Reason: ' + reason : ''}\n\nIf you believe this is an error, please contact support@escrowpay.ae.\n\nEscrow Pay · UAE`,
    });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Escrow Cancelled: ${tx.title}`,
      body: `Hi ${isSender ? tx.sender_name : tx.receiver_name || ''},\n\nYou have successfully cancelled the escrow "${tx.title}" (AED ${tx.amount?.toLocaleString()}).\n\nAny held funds will be refunded within 2–5 business days.\n\nEscrow Pay · UAE`,
    });
  } catch (e) {
    console.warn('Email notification failed:', e.message);
  }

  return Response.json({ success: true, transaction: updated });
});