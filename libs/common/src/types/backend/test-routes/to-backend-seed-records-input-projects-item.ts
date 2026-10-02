import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputProjectsItem = {
  orgId: string;
  projectId?: string;
  seedProjectId?: string;
  name: string;
  defaultBranch: string;
  remoteType: ProjectRemoteTypeEnum.Managed | ProjectRemoteTypeEnum.GitClone;
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
    remoteType: z.enum(ProjectRemoteTypeEnum),
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
