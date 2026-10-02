import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendEditConnectionOutput,
  zToBackendEditConnectionOutput
} from '#common/types/backend/routes/connections/edit-connection/edit-connection-output';
import {
  type ToBackendEditConnectionError,
  zToBackendEditConnectionError
} from './edit-connection-error';

export type ToBackendEditConnectionResponse = ToBackendResponseBase<
  'editConnection',
  ToBackendEditConnectionOutput,
  ToBackendEditConnectionError
>;

export let zToBackendEditConnectionResponse = makeToBackendResponseSchema({
  operation: 'editConnection',
  output: zToBackendEditConnectionOutput,
  error: zToBackendEditConnectionError
}).meta({ id: 'ToBackendEditConnectionResponse' });

assertTypesEqual<
  ToBackendEditConnectionResponse,
  z.infer<typeof zToBackendEditConnectionResponse>
>({ value: true });
