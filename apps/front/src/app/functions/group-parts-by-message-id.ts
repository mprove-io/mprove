import { SessionPartApi } from '#common/interfaces/backend/session-part-api';

export function groupPartsByMessageId(parts: SessionPartApi[]): {
  [messageId: string]: SessionPartApi[];
} {
  let grouped: { [messageId: string]: SessionPartApi[] } = {};

  parts.forEach(part => {
    if (!grouped[part.messageId]) {
      grouped[part.messageId] = [];
    }
    grouped[part.messageId].push(part);
  });

  return grouped;
}
