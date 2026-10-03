import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type Project = {
  orgId: string;
  projectId: string;
  remoteType: EnumValues<typeof ProjectRemoteTypeEnum>;
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
    remoteType: z.enum(ProjectRemoteTypeEnum),
    name: z.string(),
    gitUrl: z.string().nullish(),
    defaultBranch: z.string().nullish(),
    publicKey: z.string().nullish(),
    isE2bApiKeySet: z.boolean().nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'Project' });

assertTypesEqual<Project, z.infer<typeof zProject>>({ value: true });
