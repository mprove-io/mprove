import type { AgentEvent } from '#backend/services/agent.service';

export function forTestsExtractDialogLines(item: {
  events: AgentEvent[];
}): string[] {
  let dialogLines: string[] = [];

  for (let e of item.events) {
    let oc = e.ocEvent;

    // User messages: message.updated events with role === 'user'
    if (oc.type === 'message.updated') {
      if (oc.properties.info.role === 'user') {
        dialogLines.push(`=== User: (message updated)`);
      }
      continue;
    }

    // Assistant text: message.part.updated events with type === 'text'
    if (oc.type === 'message.part.updated') {
      let part = oc.properties.part;
      if (part.type === 'text' && part.text) {
        dialogLines.push(`=== Assistant: ${part.text}`);
      }
    }
  }

  return dialogLines;
}
