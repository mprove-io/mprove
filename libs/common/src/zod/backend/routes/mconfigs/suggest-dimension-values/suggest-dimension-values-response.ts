import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSuggestDimensionValuesOutput,
  zToBackendSuggestDimensionValuesOutput
} from '#common/zod/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-output';
import {
  type ToBackendSuggestDimensionValuesError,
  zToBackendSuggestDimensionValuesError
} from './suggest-dimension-values-error';

export type ToBackendSuggestDimensionValuesResponse = ToBackendResponseBase<
  'suggestDimensionValues',
  ToBackendSuggestDimensionValuesOutput,
  ToBackendSuggestDimensionValuesError
>;

export let zToBackendSuggestDimensionValuesResponse =
  makeToBackendResponseSchema({
    operation: 'suggestDimensionValues',
    output: zToBackendSuggestDimensionValuesOutput,
    error: zToBackendSuggestDimensionValuesError
  }).meta({ id: 'ToBackendSuggestDimensionValuesResponse' });

assertTypesEqual<
  ToBackendSuggestDimensionValuesResponse,
  z.infer<typeof zToBackendSuggestDimensionValuesResponse>
>({ value: true });
