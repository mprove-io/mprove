import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendInvalidRequestError,
  zBackendInvalidRequestError
} from '#common/types/backend/errors/backend-invalid-request-error';

export type ValidateToBackendRequestError = BackendInvalidRequestError;

export const zValidateToBackendRequestError = zBackendInvalidRequestError;

assertTypesEqual<
  ValidateToBackendRequestError,
  z.infer<typeof zValidateToBackendRequestError>
>({ value: true });
