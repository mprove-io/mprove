import { z } from 'zod';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputSessionsItem = {
  sessionId: string;
  userId: string;
  projectId: string;
  apiKey: string;
  apiKeyPrefix: string;
  apiKeySecretHash: string;
  apiKeySalt: string;
  status:
    | SessionStatusEnum.New
    | SessionStatusEnum.Active
    | SessionStatusEnum.Paused
    | SessionStatusEnum.Error
    | SessionStatusEnum.Archived
    | SessionStatusEnum.Deleted;
  type: SessionTypeEnum.Explorer | SessionTypeEnum.Editor;
  repoId: string;
  branchId: string;
  envId: string;
};

export let zToBackendSeedRecordsInputSessionsItem = z
  .object({
    sessionId: z.string(),
    userId: z.string(),
    projectId: z.string(),
    apiKey: z.string(),
    apiKeyPrefix: z.string(),
    apiKeySecretHash: z.string(),
    apiKeySalt: z.string(),
    status: z.enum(SessionStatusEnum),
    type: z.enum(SessionTypeEnum),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendSeedRecordsInputSessionsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputSessionsItem,
  z.infer<typeof zToBackendSeedRecordsInputSessionsItem>
>({ value: true });
