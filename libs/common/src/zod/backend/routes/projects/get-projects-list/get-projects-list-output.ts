import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectsItem,
  zProjectsItem
} from '#common/zod/backend/projects-item';

export type ToBackendGetProjectsListOutput = {
  projectsList: ProjectsItem[];
};

export let zToBackendGetProjectsListOutput = z
  .object({
    projectsList: z.array(zProjectsItem)
  })
  .meta({ id: 'ToBackendGetProjectsListOutput' });

assertTypesEqual<
  ToBackendGetProjectsListOutput,
  z.infer<typeof zToBackendGetProjectsListOutput>
>({ value: true });
