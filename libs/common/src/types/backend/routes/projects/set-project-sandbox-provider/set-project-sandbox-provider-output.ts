import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Project, zProject } from '#common/types/backend/parts/project';

export type ToBackendSetProjectSandboxProviderOutput = {
  project: Project;
};

export let zToBackendSetProjectSandboxProviderOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderOutput' });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderOutput,
  z.infer<typeof zToBackendSetProjectSandboxProviderOutput>
>({ value: true });
