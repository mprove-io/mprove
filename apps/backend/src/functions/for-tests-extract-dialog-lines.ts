import type { AgentEvent } from '#backend/services/agent.service';

export function forTestsExtractDialogLines(item: {
  events: AgentEvent[];
}): string[] {
  // First pass: collect messageID → role from message.updated events
  let messageRoles = new Map<string, string>();
  for (let e of item.events) {
    let oc = e.ocEvent;
    if (oc.type === 'message.updated') {
      messageRoles.set(oc.properties.info.id, oc.properties.info.role);
    }
  }

  // Second pass: deduplicate text parts by part ID, keep latest text
  let partTexts = new Map<
    string,
    { messageID: string; text: string; order: number }
  >();
  let errors: { order: number; line: string }[] = [];
  let orderCounter = 0;

  for (let e of item.events) {
    let oc = e.ocEvent;

    if (oc.type === 'message.part.updated') {
      let part = oc.properties.part;
      if (part.type === 'text' && part.text) {
        let existing = partTexts.get(part.id);
        partTexts.set(part.id, {
          messageID: part.messageID,
          text: part.text,
          order: existing ? existing.order : orderCounter++
        });
      }
    }

    if (oc.type === 'session.error') {
      let error = oc.properties.error;
      if (error) {
        errors.push({
          order: orderCounter++,
          line: `=== Error: [${error.name}] ${(error.data as { message?: string }).message ?? JSON.stringify(error.data)}`
        });
      }
    }
  }

  // Build dialog lines sorted by first appearance
  let allEntries: { order: number; line: string }[] = [];

  for (let [_partId, entry] of partTexts) {
    let role = messageRoles.get(entry.messageID);
    let label = role === 'user' ? 'User' : 'Assistant';
    allEntries.push({
      order: entry.order,
      line: `=== ${label}: ${entry.text}`
    });
  }

  allEntries.push(...errors);
  allEntries.sort((a, b) => a.order - b.order);

  return allEntries.map(e => e.line);
}
