import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/types/backend/parts/project';

export type ToBackendSetProjectTimezoneOutput = {
  project: Project;
};

export let zToBackendSetProjectTimezoneOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectTimezoneOutput' });

assertTypesEqual<
  ToBackendSetProjectTimezoneOutput,
  z.infer<typeof zToBackendSetProjectTimezoneOutput>
>({ value: true });
