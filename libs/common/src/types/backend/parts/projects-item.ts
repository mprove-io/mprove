import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectsItem = {
  projectId: string;
  name: string;
  defaultBranch: string;
};

export let zProjectsItem = z
  .object({
    projectId: z.string(),
    name: z.string(),
    defaultBranch: z.string()
  })
  .meta({ id: 'ProjectsItem' });

assertTypesEqual<ProjectsItem, z.infer<typeof zProjectsItem>>({ value: true });
