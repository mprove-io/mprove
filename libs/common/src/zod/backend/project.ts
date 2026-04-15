import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';

export let zProject = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    remoteType: z.enum(ProjectRemoteTypeEnum),
    name: z.string(),
    gitUrl: z.string().nullish(),
    defaultBranch: z.string().nullish(),
    publicKey: z.string().nullish(),
    isZenApiKeySet: z.boolean().nullish(),
    isAnthropicApiKeySet: z.boolean().nullish(),
    isOpenaiApiKeySet: z.boolean().nullish(),
    isE2bApiKeySet: z.boolean().nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'Project' });

export type Project = z.infer<typeof zProject>;
