import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FetchSampleResult = {
  columnNames: string[];
  rows: string[][];
  errorMessage?: string;
};

export let zFetchSampleResult = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'FetchSampleResult' });

assertTypesEqual<FetchSampleResult, z.infer<typeof zFetchSampleResult>>({
  value: true
});
