import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';

export function groupPartsByMessageId(parts: AgentPartApi[]): {
  [messageId: string]: AgentPartApi[];
} {
  let grouped: { [messageId: string]: AgentPartApi[] } = {};
  for (let part of parts) {
    if (!grouped[part.messageId]) {
      grouped[part.messageId] = [];
    }
    grouped[part.messageId].push(part);
  }
  return grouped;
}
