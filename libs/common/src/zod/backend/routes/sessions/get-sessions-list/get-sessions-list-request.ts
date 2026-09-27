import { z } from 'zod';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSessionsListInput = {
  projectId: string;
  currentSessionId?: string;
  includeArchived?: boolean;
  archivedLimit?: number;
  archivedLastCreatedTs?: number;
  sessionType: SessionTypeEnum.Explorer | SessionTypeEnum.Editor;
};

export type ToBackendGetSessionsListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetSessionsListInput;
};

export let zToBackendGetSessionsListInput = z
  .object({
    projectId: z.string(),
    currentSessionId: z.string().nullish(),
    includeArchived: z.boolean().nullish(),
    archivedLimit: z.number().nullish(),
    archivedLastCreatedTs: z.number().nullish(),
    sessionType: z.enum(SessionTypeEnum)
  })
  .meta({ id: 'ToBackendGetSessionsListInput' });

export let zToBackendGetSessionsListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetSessionsListInput
  })
  .meta({ id: 'ToBackendGetSessionsListRequest' });

assertTypesEqual<
  ToBackendGetSessionsListInput,
  z.infer<typeof zToBackendGetSessionsListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSessionsListRequest,
  z.infer<typeof zToBackendGetSessionsListRequest>
>({ value: true });
