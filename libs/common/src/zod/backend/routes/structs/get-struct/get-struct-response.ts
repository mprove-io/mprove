import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetStructOutput,
  zToBackendGetStructOutput
} from '#common/zod/backend/routes/structs/get-struct/get-struct-output';
import {
  type ToBackendGetStructError,
  zToBackendGetStructError
} from './get-struct-error';

export type ToBackendGetStructResponse = ToBackendResponseBase<
  'getStruct',
  ToBackendGetStructOutput,
  ToBackendGetStructError
>;

export let zToBackendGetStructResponse = makeToBackendResponseSchema({
  operation: 'getStruct',
  output: zToBackendGetStructOutput,
  error: zToBackendGetStructError
}).meta({ id: 'ToBackendGetStructResponse' });

assertTypesEqual<
  ToBackendGetStructResponse,
  z.infer<typeof zToBackendGetStructResponse>
>({ value: true });
