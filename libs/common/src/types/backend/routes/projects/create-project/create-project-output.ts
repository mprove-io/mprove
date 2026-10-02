import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/types/backend/parts/project';

export type ToBackendCreateProjectOutput = {
  project: Project;
};

export let zToBackendCreateProjectOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendCreateProjectOutput' });

assertTypesEqual<
  ToBackendCreateProjectOutput,
  z.infer<typeof zToBackendCreateProjectOutput>
>({ value: true });
