import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSuggestDimensionValuesOutput = {
  matchedValues?: {
    value: string;
    count: number;
  }[];
  matchedValuesMessage?: string;
  errorMessage?: string;
};

export let zToBackendSuggestDimensionValuesOutput = z
  .object({
    matchedValues: z
      .array(
        z.object({
          value: z.string(),
          count: z.number().int()
        })
      )
      .nullish(),
    matchedValuesMessage: z.string().nullish(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendSuggestDimensionValuesOutput' });

assertTypesEqual<
  ToBackendSuggestDimensionValuesOutput,
  z.infer<typeof zToBackendSuggestDimensionValuesOutput>
>({ value: true });
