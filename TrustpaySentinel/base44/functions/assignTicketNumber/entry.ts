import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();

  if (body.event?.type !== 'create') {
    return Response.json({ skipped: true });
  }

  const ticketId = body.event?.entity_id;
  const allTickets = await base44.asServiceRole.entities.Ticket.list('-created_date', 500);
  const count = allTickets.length;
  const ticketNumber = `CMP-${String(count).padStart(4, '0')}`;

  await base44.asServiceRole.entities.Ticket.update(ticketId, { ticket_number: ticketNumber });
  return Response.json({ success: true, ticket_number: ticketNumber });
});