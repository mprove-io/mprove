import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import { zSessionType } from '#common/types/backend/parts/session/session-type';

export type ToBackendGetSessionsListRequest = {
  operation: 'getSessionsList';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    currentSessionId?: string;
    includeArchived?: boolean;
    archivedLimit?: number;
    archivedLastCreatedTs?: number;
    sessionType: SessionType;
  };
};

export let zToBackendGetSessionsListRequest = z
  .strictObject({
    operation: z.literal('getSessionsList'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        currentSessionId: z.string().nullish(),
        includeArchived: z.boolean().nullish(),
        archivedLimit: z.number().nullish(),
        archivedLastCreatedTs: z.number().nullish(),
        sessionType: zSessionType
      })
      .meta({ id: 'ToBackendGetSessionsListInput' })
  })
  .meta({ id: 'ToBackendGetSessionsListRequest' });

assertTypesEqual<
  ToBackendGetSessionsListRequest,
  z.infer<typeof zToBackendGetSessionsListRequest>
>({ value: true });
