import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type BackendInvalidRequestError,
  zBackendInvalidRequestError
} from '#common/zod/backend/errors/backend-invalid-request-error';
import type { ToBackendFailure } from '#common/zod/backend/response/to-backend-failure';
import {
  type ToBackendResponseMetadata,
  zToBackendResponseMetadata
} from '#common/zod/backend/response/to-backend-response-metadata';

export type ToBackendUnknownOperationResponse = Extend<
  ToBackendResponseMetadata<string>,
  ToBackendFailure<BackendInvalidRequestError>
>;

export let zToBackendUnknownOperationResponse = z.object({
  type: z.literal('Failure'),
  ...zToBackendResponseMetadata.shape,
  error: zBackendInvalidRequestError
});

assertTypesEqual<
  ToBackendUnknownOperationResponse,
  z.infer<typeof zToBackendUnknownOperationResponse>
>({ value: true });
