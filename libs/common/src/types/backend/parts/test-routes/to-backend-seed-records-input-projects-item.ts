import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';
import { zProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

export type ToBackendSeedRecordsInputProjectsItem = {
  orgId: string;
  projectId?: string;
  seedProjectId?: string;
  name: string;
  defaultBranch: string;
  remoteType: ProjectRemoteType;
  gitUrl?: string;
  publicKey?: string;
  privateKey?: string;
  publicKeyEncrypted?: string;
  privateKeyEncrypted?: string;
  passPhrase?: string;
  e2bApiKey?: string;
};

export let zToBackendSeedRecordsInputProjectsItem = z
  .object({
    orgId: z.string(),
    projectId: z.string().nullish(),
    seedProjectId: z.string().nullish(),
    name: z.string(),
    defaultBranch: z.string(),
    remoteType: zProjectRemoteType,
    gitUrl: z.string().nullish(),
    publicKey: z.string().nullish(),
    privateKey: z.string().nullish(),
    publicKeyEncrypted: z.string().nullish(),
    privateKeyEncrypted: z.string().nullish(),
    passPhrase: z.string().nullish(),
    e2bApiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputProjectsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputProjectsItem,
  z.infer<typeof zToBackendSeedRecordsInputProjectsItem>
>({ value: true });
