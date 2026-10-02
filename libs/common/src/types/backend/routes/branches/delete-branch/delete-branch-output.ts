import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteBranchOutput = Record<string, never>;

export let zToBackendDeleteBranchOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteBranchOutput' });

assertTypesEqual<
  ToBackendDeleteBranchOutput,
  z.infer<typeof zToBackendDeleteBranchOutput>
>({ value: true });
