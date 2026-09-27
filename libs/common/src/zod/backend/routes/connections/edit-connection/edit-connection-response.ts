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
  type ToBackendEditConnectionError,
  zToBackendEditConnectionError
} from './edit-connection-error';

export type ToBackendEditConnectionOutput = {
  connection: ProjectConnection;
};

export type ToBackendEditConnectionResponse = ToBackendResponse<
  ToBackendEditConnectionOutput,
  ToBackendEditConnectionError
>;

export let zToBackendEditConnectionOutput = z
  .object({
    connection: zProjectConnection
  })
  .meta({ id: 'ToBackendEditConnectionOutput' });

export let zToBackendEditConnectionResponse = makeToBackendResponseSchema({
  success: zToBackendEditConnectionOutput,
  error: zToBackendEditConnectionError
}).meta({ id: 'ToBackendEditConnectionResponse' });

assertTypesEqual<
  ToBackendEditConnectionOutput,
  z.infer<typeof zToBackendEditConnectionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditConnectionResponse,
  z.infer<typeof zToBackendEditConnectionResponse>
>({ value: true });
