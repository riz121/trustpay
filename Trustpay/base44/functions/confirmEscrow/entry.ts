import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { transaction_id } = await req.json();
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
    return Response.json({ error: `Transaction is already ${tx.status}` }, { status: 400 });
  }

  if (isSender && tx.sender_confirmed) {
    return Response.json({ error: 'You have already confirmed this transaction' }, { status: 400 });
  }
  if (isReceiver && tx.receiver_confirmed) {
    return Response.json({ error: 'You have already confirmed this transaction' }, { status: 400 });
  }

  const updateData = {};
  let released = false;

  if (isSender) {
    updateData.sender_confirmed = true;
    updateData.status = tx.receiver_confirmed ? 'released' : 'sender_confirmed';
    released = tx.receiver_confirmed;
  } else {
    updateData.receiver_confirmed = true;
    updateData.status = tx.sender_confirmed ? 'released' : 'receiver_confirmed';
    released = tx.sender_confirmed;
  }

  const updated = await base44.asServiceRole.entities.EscrowTransaction.update(tx.id, updateData);

  // Send emails (best-effort)
  try {
    if (released) {
      await base44.integrations.Core.SendEmail({
        to: tx.sender_email,
        subject: `Escrow Released: ${tx.title}`,
        body: `Hi ${tx.sender_name || ''},\n\nBoth parties have confirmed. The escrow for "${tx.title}" (AED ${tx.amount?.toLocaleString()}) has been released to ${tx.receiver_name || tx.receiver_email}.\n\nEscrow Pay · UAE`,
      });
      await base44.integrations.Core.SendEmail({
        to: tx.receiver_email,
        subject: `Funds Released: ${tx.title}`,
        body: `Hi ${tx.receiver_name || ''},\n\nBoth parties have confirmed. AED ${tx.amount?.toLocaleString()} from "${tx.title}" has been released to you.\n\nFunds will arrive in your account within 1–2 business days.\n\nEscrow Pay · UAE`,
      });
    } else {
      const otherEmail = isSender ? tx.receiver_email : tx.sender_email;
      const otherName = isSender ? tx.receiver_name : tx.sender_name;
      const thisName = isSender ? tx.sender_name : tx.receiver_name;
      await base44.integrations.Core.SendEmail({
        to: otherEmail,
        subject: `Action required: Confirm escrow "${tx.title}"`,
        body: `Hi ${otherName || ''},\n\n${thisName || 'The other party'} has confirmed the escrow transaction "${tx.title}" (AED ${tx.amount?.toLocaleString()}).\n\nPlease log in to Escrow Pay to confirm on your side so funds can be released.\n\nEscrow Pay · UAE`,
      });
    }
  } catch (e) {
    console.warn('Email notification failed:', e.message);
  }

  return Response.json({ success: true, transaction: updated, released });
});