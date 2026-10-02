import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateConnectionOutput,
  zToBackendCreateConnectionOutput
} from '#common/types/backend/routes/connections/create-connection/create-connection-output';
import {
  type ToBackendCreateConnectionError,
  zToBackendCreateConnectionError
} from './create-connection-error';

export type ToBackendCreateConnectionResponse = ToBackendResponseBase<
  'createConnection',
  ToBackendCreateConnectionOutput,
  ToBackendCreateConnectionError
>;

export let zToBackendCreateConnectionResponse = makeToBackendResponseSchema({
  operation: 'createConnection',
  output: zToBackendCreateConnectionOutput,
  error: zToBackendCreateConnectionError
}).meta({ id: 'ToBackendCreateConnectionResponse' });

assertTypesEqual<
  ToBackendCreateConnectionResponse,
  z.infer<typeof zToBackendCreateConnectionResponse>
>({ value: true });
