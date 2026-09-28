import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteConnectionOutput,
  zToBackendDeleteConnectionOutput
} from '#common/zod/backend/routes/connections/delete-connection/delete-connection-output';
import {
  type ToBackendDeleteConnectionError,
  zToBackendDeleteConnectionError
} from './delete-connection-error';

export type ToBackendDeleteConnectionResponse = ToBackendResponseBase<
  'deleteConnection',
  ToBackendDeleteConnectionOutput,
  ToBackendDeleteConnectionError
>;

export let zToBackendDeleteConnectionResponse = makeToBackendResponseSchema({
  operation: 'deleteConnection',
  output: zToBackendDeleteConnectionOutput,
  error: zToBackendDeleteConnectionError
}).meta({ id: 'ToBackendDeleteConnectionResponse' });

assertTypesEqual<
  ToBackendDeleteConnectionResponse,
  z.infer<typeof zToBackendDeleteConnectionResponse>
>({ value: true });
