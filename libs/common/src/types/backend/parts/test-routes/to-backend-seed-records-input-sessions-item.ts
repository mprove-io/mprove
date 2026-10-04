import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import { zSessionStatus } from '#common/types/backend/parts/session/session-status';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import { zSessionType } from '#common/types/backend/parts/session/session-type';

export type ToBackendSeedRecordsInputSessionsItem = {
  sessionId: string;
  userId: string;
  projectId: string;
  apiKey: string;
  apiKeyPrefix: string;
  apiKeySecretHash: string;
  apiKeySalt: string;
  status: SessionStatus;
  type: SessionType;
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
    status: zSessionStatus,
    type: zSessionType,
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendSeedRecordsInputSessionsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputSessionsItem,
  z.infer<typeof zToBackendSeedRecordsInputSessionsItem>
>({ value: true });
