import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteProviderOutput = Record<string, never>;

export let zToBackendDeleteProviderOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteProviderOutput' });

assertTypesEqual<
  ToBackendDeleteProviderOutput,
  z.infer<typeof zToBackendDeleteProviderOutput>
>({ value: true });
