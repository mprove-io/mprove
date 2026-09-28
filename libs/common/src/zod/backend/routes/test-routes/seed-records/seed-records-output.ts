import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsOutput = Record<string, never>;

export let zToBackendSeedRecordsOutput = z
  .object({})
  .meta({ id: 'ToBackendSeedRecordsOutput' });

assertTypesEqual<
  ToBackendSeedRecordsOutput,
  z.infer<typeof zToBackendSeedRecordsOutput>
>({ value: true });
