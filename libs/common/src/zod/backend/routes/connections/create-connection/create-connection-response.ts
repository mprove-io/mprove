import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectConnection,
  zProjectConnection
} from '#common/zod/backend/project-connection';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateConnectionError,
  zToBackendCreateConnectionError
} from './create-connection-error';

export type ToBackendCreateConnectionOutput = {
  connection: ProjectConnection;
};

export type ToBackendCreateConnectionResponse = ToBackendResponse<
  ToBackendCreateConnectionOutput,
  ToBackendCreateConnectionError
>;

export let zToBackendCreateConnectionOutput = z
  .object({
    connection: zProjectConnection
  })
  .meta({ id: 'ToBackendCreateConnectionOutput' });

export let zToBackendCreateConnectionResponse = makeToBackendResponseSchema({
  success: zToBackendCreateConnectionOutput,
  error: zToBackendCreateConnectionError
}).meta({ id: 'ToBackendCreateConnectionResponse' });

assertTypesEqual<
  ToBackendCreateConnectionOutput,
  z.infer<typeof zToBackendCreateConnectionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateConnectionResponse,
  z.infer<typeof zToBackendCreateConnectionResponse>
>({ value: true });
