import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteProjectOutput = Record<string, never>;

export let zToBackendDeleteProjectOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteProjectOutput' });

assertTypesEqual<
  ToBackendDeleteProjectOutput,
  z.infer<typeof zToBackendDeleteProjectOutput>
>({ value: true });
