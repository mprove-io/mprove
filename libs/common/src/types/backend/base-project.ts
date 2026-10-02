import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';

export let zBaseProject = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    remoteType: z.enum(ProjectRemoteTypeEnum),
    st: z.string(),
    lt: z.string()
  })
  .meta({ id: 'BaseProject' });

export type BaseProject = z.infer<typeof zBaseProject>;
