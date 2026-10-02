import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSetUserNameOutput,
  zToBackendSetUserNameOutput
} from '#common/types/backend/routes/users/set-user-name/set-user-name-output';
import {
  type ToBackendSetUserNameError,
  zToBackendSetUserNameError
} from './set-user-name-error';

export type ToBackendSetUserNameResponse = ToBackendResponseBase<
  'setUserName',
  ToBackendSetUserNameOutput,
  ToBackendSetUserNameError
>;

export let zToBackendSetUserNameResponse = makeToBackendResponseSchema({
  operation: 'setUserName',
  output: zToBackendSetUserNameOutput,
  error: zToBackendSetUserNameError
}).meta({ id: 'ToBackendSetUserNameResponse' });

assertTypesEqual<
  ToBackendSetUserNameResponse,
  z.infer<typeof zToBackendSetUserNameResponse>
>({ value: true });
