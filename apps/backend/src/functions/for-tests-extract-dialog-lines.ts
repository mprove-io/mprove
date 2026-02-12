import type {
  PromptRequest,
  SessionNotification
} from '@agentclientprotocol/sdk';
import type { AgentEvent } from '#backend/services/agent.service';

export function forTestsExtractDialogLines(item: {
  events: AgentEvent[];
}): string[] {
  let dialogLines: string[] = [];

  for (let e of item.events) {
    // User messages: session/prompt requests from client
    let p = e.payload as { method?: string; params?: unknown };

    // User messages: session/prompt requests from client
    if (e.sender === 'client' && p.method === 'session/prompt') {
      let params = p.params as PromptRequest;
      for (let block of params.prompt) {
        if (block.type === 'text') {
          dialogLines.push(`=== User: ${block.text}`);
        }
      }
      continue;
    }

    // Agent messages: session/update notifications with agent_message_chunk
    if (p.method === 'session/update') {
      let notif = p.params as SessionNotification;
      if (
        notif.update.sessionUpdate === 'agent_message_chunk' &&
        notif.update.content.type === 'text'
      ) {
        dialogLines.push(`=== Assistant: ${notif.update.content.text}`);
      }
    }
  }

  return dialogLines;
}
