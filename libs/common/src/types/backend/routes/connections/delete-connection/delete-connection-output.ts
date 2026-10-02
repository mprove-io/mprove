import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteConnectionOutput = Record<string, never>;

export let zToBackendDeleteConnectionOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteConnectionOutput' });

assertTypesEqual<
  ToBackendDeleteConnectionOutput,
  z.infer<typeof zToBackendDeleteConnectionOutput>
>({ value: true });
