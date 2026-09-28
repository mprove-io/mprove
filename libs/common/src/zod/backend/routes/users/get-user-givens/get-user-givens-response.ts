import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetUserGivensOutput,
  zToBackendGetUserGivensOutput
} from '#common/zod/backend/routes/users/get-user-givens/get-user-givens-output';
import {
  type ToBackendGetUserGivensError,
  zToBackendGetUserGivensError
} from './get-user-givens-error';

export type ToBackendGetUserGivensResponse = ToBackendResponseBase<
  'getUserGivens',
  ToBackendGetUserGivensOutput,
  ToBackendGetUserGivensError
>;

export let zToBackendGetUserGivensResponse = makeToBackendResponseSchema({
  operation: 'getUserGivens',
  output: zToBackendGetUserGivensOutput,
  error: zToBackendGetUserGivensError
}).meta({ id: 'ToBackendGetUserGivensResponse' });

assertTypesEqual<
  ToBackendGetUserGivensResponse,
  z.infer<typeof zToBackendGetUserGivensResponse>
>({ value: true });
