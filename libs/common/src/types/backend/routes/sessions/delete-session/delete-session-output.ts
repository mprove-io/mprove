import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteSessionOutput = Record<string, never>;

export let zToBackendDeleteSessionOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteSessionOutput' });

assertTypesEqual<
  ToBackendDeleteSessionOutput,
  z.infer<typeof zToBackendDeleteSessionOutput>
>({ value: true });
