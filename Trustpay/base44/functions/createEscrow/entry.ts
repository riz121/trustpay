import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, amount, receiver_email, receiver_name, notes, release_date } = await req.json();

  if (!title || !amount || !receiver_email) {
    return Response.json({ error: 'Missing required fields: title, amount, receiver_email' }, { status: 400 });
  }
  if (typeof amount !== 'number' || amount < 100) {
    return Response.json({ error: 'Minimum transaction amount is AED 100' }, { status: 400 });
  }
  if (amount > 500000) {
    return Response.json({ error: 'Maximum transaction amount is AED 500,000' }, { status: 400 });
  }
  if (receiver_email.toLowerCase() === user.email.toLowerCase()) {
    return Response.json({ error: 'You cannot create an escrow with yourself' }, { status: 400 });
  }

  const transaction = await base44.entities.EscrowTransaction.create({
    title,
    amount,
    receiver_email: receiver_email.toLowerCase(),
    receiver_name: receiver_name || '',
    notes: notes || '',
    release_date: release_date || null,
    sender_email: user.email.toLowerCase(),
    sender_name: user.full_name || '',
    status: 'funded',
    sender_confirmed: false,
    receiver_confirmed: false,
  });

  // Notify receiver (best-effort — may fail if not an app user)
  try {
    await base44.integrations.Core.SendEmail({
      to: receiver_email,
      subject: `You have a new escrow transaction: ${title}`,
      body: `Hi${receiver_name ? ' ' + receiver_name : ''},\n\n${user.full_name || user.email} has created an escrow transaction for you.\n\nDetails:\n- Title: ${title}\n- Amount: AED ${amount.toLocaleString()}\n- Notes: ${notes || 'None'}\n\nPlease log in to Escrow Pay to review and confirm this transaction.\n\nEscrow Pay · UAE`,
    });
  } catch (e) {
    console.warn('Could not email receiver:', e.message);
  }

  // Confirm to sender (best-effort)
  try {
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Escrow created: ${title}`,
      body: `Hi ${user.full_name || ''},\n\nYour escrow transaction has been created successfully.\n\nDetails:\n- Title: ${title}\n- Amount: AED ${amount.toLocaleString()}\n- Receiver: ${receiver_name || receiver_email}\n\nFunds will be held securely until both parties confirm completion.\n\nEscrow Pay · UAE`,
    });
  } catch (e) {
    console.warn('Could not email sender:', e.message);
  }

  return Response.json({ success: true, transaction });
});