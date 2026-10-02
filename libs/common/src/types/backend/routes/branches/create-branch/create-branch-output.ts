import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateBranchOutput = Record<string, never>;

export let zToBackendCreateBranchOutput = z
  .object({})
  .meta({ id: 'ToBackendCreateBranchOutput' });

assertTypesEqual<
  ToBackendCreateBranchOutput,
  z.infer<typeof zToBackendCreateBranchOutput>
>({ value: true });
