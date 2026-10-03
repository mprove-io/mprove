import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectExplorerSessionLink = {
  projectId: string;
  sessionId: string;
  repoId: string;
  branchId: string;
  envId: string;
  tabId?: string;
  navTs?: number;
};

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

assertTypesEqual<
  ProjectExplorerSessionLink,
  z.infer<typeof zProjectExplorerSessionLink>
>({ value: true });
