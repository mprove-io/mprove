import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectRemoteType,
  zProjectRemoteType
} from '#common/types/backend/parts/project/project-remote-type';

export type Project = {
  orgId: string;
  projectId: string;
  remoteType: ProjectRemoteType;
  name: string;
  gitUrl?: string;
  defaultBranch?: string;
  publicKey?: string;
  isE2bApiKeySet?: boolean;
  serverTs?: number;
};

export let zProject = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    remoteType: zProjectRemoteType,
    name: z.string(),
    gitUrl: z.string().nullish(),
    defaultBranch: z.string().nullish(),
    publicKey: z.string().nullish(),
    isE2bApiKeySet: z.boolean().nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'Project' });

assertTypesEqual<Project, z.infer<typeof zProject>>({ value: true });
