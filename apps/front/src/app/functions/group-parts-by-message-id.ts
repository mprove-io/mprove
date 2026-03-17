import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';

export function groupPartsByMessageId(parts: AgentPartApi[]): {
  [messageId: string]: AgentPartApi[];
} {
  let grouped: { [messageId: string]: AgentPartApi[] } = {};
  parts.forEach(part => {
    if (!grouped[part.messageId]) {
      grouped[part.messageId] = [];
    }
    grouped[part.messageId].push(part);
  });
  return grouped;
}
