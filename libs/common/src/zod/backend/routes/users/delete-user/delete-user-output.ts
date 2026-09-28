import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserOutput = Record<string, never>;

export let zToBackendDeleteUserOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserOutput' });

assertTypesEqual<
  ToBackendDeleteUserOutput,
  z.infer<typeof zToBackendDeleteUserOutput>
>({ value: true });
