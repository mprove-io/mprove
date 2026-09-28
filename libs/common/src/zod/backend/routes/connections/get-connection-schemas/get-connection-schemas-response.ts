import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetConnectionSchemasOutput,
  zToBackendGetConnectionSchemasOutput
} from '#common/zod/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';
import {
  type ToBackendGetConnectionSchemasError,
  zToBackendGetConnectionSchemasError
} from './get-connection-schemas-error';

export type ToBackendGetConnectionSchemasResponse = ToBackendResponseBase<
  'getConnectionSchemas',
  ToBackendGetConnectionSchemasOutput,
  ToBackendGetConnectionSchemasError
>;

export let zToBackendGetConnectionSchemasResponse = makeToBackendResponseSchema(
  {
    operation: 'getConnectionSchemas',
    output: zToBackendGetConnectionSchemasOutput,
    error: zToBackendGetConnectionSchemasError
  }
).meta({ id: 'ToBackendGetConnectionSchemasResponse' });

assertTypesEqual<
  ToBackendGetConnectionSchemasResponse,
  z.infer<typeof zToBackendGetConnectionSchemasResponse>
>({ value: true });
