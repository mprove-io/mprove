import type { Part } from '@opencode-ai/sdk/v2';
import type { OcPartTab } from '#backend/drizzle/postgres/tables/oc-parts';

export function makeOcPart(item: {
  partId: string;
  messageId: string;
  sessionId: string;
  ocPart: Part;
}): OcPartTab {
  let now: number = Date.now();

  let partTab: OcPartTab = {
    partId: item.partId,
    messageId: item.messageId,
    sessionId: item.sessionId,
    type: item.ocPart.type,
    ocPart: item.ocPart,
    createdTs: now,
    serverTs: undefined,
    keyTag: undefined
  };

  return partTab;
}
