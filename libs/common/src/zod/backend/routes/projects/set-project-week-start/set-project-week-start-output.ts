import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/zod/backend/project';

export type ToBackendSetProjectWeekStartOutput = {
  project: Project;
};

export let zToBackendSetProjectWeekStartOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectWeekStartOutput' });

assertTypesEqual<
  ToBackendSetProjectWeekStartOutput,
  z.infer<typeof zToBackendSetProjectWeekStartOutput>
>({ value: true });
