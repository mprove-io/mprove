import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSuggestDimensionValuesError,
  zToBackendSuggestDimensionValuesError
} from './suggest-dimension-values-error';

export type ToBackendSuggestDimensionValuesOutput = {
  matchedValues?: {
    value: string;
    count: number;
  }[];
  matchedValuesMessage?: string;
  errorMessage?: string;
};

export type ToBackendSuggestDimensionValuesResponse = ToBackendResponse<
  ToBackendSuggestDimensionValuesOutput,
  ToBackendSuggestDimensionValuesError
>;

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

export let zToBackendSuggestDimensionValuesResponse =
  makeToBackendResponseSchema({
    success: zToBackendSuggestDimensionValuesOutput,
    error: zToBackendSuggestDimensionValuesError
  }).meta({ id: 'ToBackendSuggestDimensionValuesResponse' });

assertTypesEqual<
  ToBackendSuggestDimensionValuesOutput,
  z.infer<typeof zToBackendSuggestDimensionValuesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSuggestDimensionValuesResponse,
  z.infer<typeof zToBackendSuggestDimensionValuesResponse>
>({ value: true });
