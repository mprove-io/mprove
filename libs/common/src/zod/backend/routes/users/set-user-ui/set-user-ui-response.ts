import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetUserUiOutput,
  zToBackendSetUserUiOutput
} from '#common/zod/backend/routes/users/set-user-ui/set-user-ui-output';
import {
  type ToBackendSetUserUiError,
  zToBackendSetUserUiError
} from './set-user-ui-error';

export type ToBackendSetUserUiResponse = ToBackendResponseBase<
  'setUserUi',
  ToBackendSetUserUiOutput,
  ToBackendSetUserUiError
>;

export let zToBackendSetUserUiResponse = makeToBackendResponseSchema({
  operation: 'setUserUi',
  output: zToBackendSetUserUiOutput,
  error: zToBackendSetUserUiError
}).meta({ id: 'ToBackendSetUserUiResponse' });

assertTypesEqual<
  ToBackendSetUserUiResponse,
  z.infer<typeof zToBackendSetUserUiResponse>
>({ value: true });
