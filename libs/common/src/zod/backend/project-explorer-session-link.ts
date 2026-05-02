import { z } from 'zod';

export let zProjectExplorerSessionLink = z
  .object({
    projectId: z.string(),
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    tabId: z.string().nullish(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectExplorerSessionLink' });

export type ProjectExplorerSessionLink = z.infer<
  typeof zProjectExplorerSessionLink
>;
