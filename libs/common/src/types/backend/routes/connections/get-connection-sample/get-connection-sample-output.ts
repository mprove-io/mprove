import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionSampleOutput = {
  columnNames: string[];
  rows: string[][];
  errorMessage?: string;
};

export let zToBackendGetConnectionSampleOutput = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionSampleOutput' });

assertTypesEqual<
  ToBackendGetConnectionSampleOutput,
  z.infer<typeof zToBackendGetConnectionSampleOutput>
>({ value: true });
