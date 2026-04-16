import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, account_status, verification_level, internal_notes } = await req.json();

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 });
  }

  const updates = {};
  if (account_status !== undefined) updates.account_status = account_status;
  if (verification_level !== undefined) updates.verification_level = verification_level;
  if (internal_notes) updates.internal_notes = internal_notes;

  const updated = await base44.asServiceRole.entities.User.update(userId, updates);
  return Response.json({ success: true, user: updated });
});