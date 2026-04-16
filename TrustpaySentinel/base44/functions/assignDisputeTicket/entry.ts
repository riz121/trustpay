import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { event, data } = await req.json();

  if (event?.type !== 'create') {
    return Response.json({ ok: true });
  }

  const disputeId = event.entity_id;

  // Count all disputes to generate a sequential ticket number
  const allDisputes = await base44.asServiceRole.entities.Dispute.list('-created_date', 1000);
  const ticketNum = String(allDisputes.length).padStart(4, '0');
  const ticketNumber = `TKT-${ticketNum}`;

  await base44.asServiceRole.entities.Dispute.update(disputeId, { ticket_number: ticketNumber });

  return Response.json({ ok: true, ticket_number: ticketNumber });
});