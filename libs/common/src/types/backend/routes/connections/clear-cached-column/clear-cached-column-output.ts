import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendClearCachedColumnOutput = Record<string, never>;

export let zToBackendClearCachedColumnOutput = z
  .object({})
  .meta({ id: 'ToBackendClearCachedColumnOutput' });

assertTypesEqual<
  ToBackendClearCachedColumnOutput,
  z.infer<typeof zToBackendClearCachedColumnOutput>
>({ value: true });
