import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteRecordsOutput = Record<string, never>;

export let zToBackendDeleteRecordsOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteRecordsOutput' });

assertTypesEqual<
  ToBackendDeleteRecordsOutput,
  z.infer<typeof zToBackendDeleteRecordsOutput>
>({ value: true });
