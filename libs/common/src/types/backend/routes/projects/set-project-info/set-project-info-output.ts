import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/types/backend/parts/project';

export type ToBackendSetProjectInfoOutput = {
  project: Project;
};

export let zToBackendSetProjectInfoOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectInfoOutput' });

assertTypesEqual<
  ToBackendSetProjectInfoOutput,
  z.infer<typeof zToBackendSetProjectInfoOutput>
>({ value: true });
