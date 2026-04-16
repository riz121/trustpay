import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, password } = await req.json();

  if (!userId || !password || password.length < 6) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }

  await base44.asServiceRole.entities.User.update(userId, { password });

  return Response.json({ success: true });
});