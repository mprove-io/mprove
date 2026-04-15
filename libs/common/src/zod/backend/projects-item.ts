import { z } from 'zod';

export let zProjectsItem = z
  .object({
    projectId: z.string(),
    name: z.string(),
    defaultBranch: z.string()
  })
  .meta({ id: 'ProjectsItem' });

export type ProjectsItem = z.infer<typeof zProjectsItem>;
