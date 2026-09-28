import { z } from 'zod';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

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
    sessionType: SessionTypeEnum.Explorer | SessionTypeEnum.Editor;
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
        sessionType: z.enum(SessionTypeEnum)
      })
      .meta({ id: 'ToBackendGetSessionsListInput' })
  })
  .meta({ id: 'ToBackendGetSessionsListRequest' });

assertTypesEqual<
  ToBackendGetSessionsListRequest,
  z.infer<typeof zToBackendGetSessionsListRequest>
>({ value: true });
