import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type Project,
  zProject
} from '#common/types/backend/parts/project/project';

export type ToBackendSetProjectAllowTimezonesOutput = {
  project: Project;
};

export let zToBackendSetProjectAllowTimezonesOutput = z
  .object({
    project: zProject
  })
  .meta({ id: 'ToBackendSetProjectAllowTimezonesOutput' });

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesOutput,
  z.infer<typeof zToBackendSetProjectAllowTimezonesOutput>
>({ value: true });
