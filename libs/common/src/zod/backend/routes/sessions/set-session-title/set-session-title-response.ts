import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetSessionTitleOutput,
  zToBackendSetSessionTitleOutput
} from '#common/zod/backend/routes/sessions/set-session-title/set-session-title-output';
import {
  type ToBackendSetSessionTitleError,
  zToBackendSetSessionTitleError
} from './set-session-title-error';

export type ToBackendSetSessionTitleResponse = ToBackendResponseBase<
  'setSessionTitle',
  ToBackendSetSessionTitleOutput,
  ToBackendSetSessionTitleError
>;

export let zToBackendSetSessionTitleResponse = makeToBackendResponseSchema({
  operation: 'setSessionTitle',
  output: zToBackendSetSessionTitleOutput,
  error: zToBackendSetSessionTitleError
}).meta({ id: 'ToBackendSetSessionTitleResponse' });

assertTypesEqual<
  ToBackendSetSessionTitleResponse,
  z.infer<typeof zToBackendSetSessionTitleResponse>
>({ value: true });
