import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetSuggestFieldsOutput,
  zToBackendGetSuggestFieldsOutput
} from '#common/zod/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-output';
import {
  type ToBackendGetSuggestFieldsError,
  zToBackendGetSuggestFieldsError
} from './get-suggest-fields-error';

export type ToBackendGetSuggestFieldsResponse = ToBackendResponseBase<
  'getSuggestFields',
  ToBackendGetSuggestFieldsOutput,
  ToBackendGetSuggestFieldsError
>;

export let zToBackendGetSuggestFieldsResponse = makeToBackendResponseSchema({
  operation: 'getSuggestFields',
  output: zToBackendGetSuggestFieldsOutput,
  error: zToBackendGetSuggestFieldsError
}).meta({ id: 'ToBackendGetSuggestFieldsResponse' });

assertTypesEqual<
  ToBackendGetSuggestFieldsResponse,
  z.infer<typeof zToBackendGetSuggestFieldsResponse>
>({ value: true });
