import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendIdempUserMismatchError,
  zBackendIdempUserMismatchError
} from '#common/types/backend/errors/backend-idemp-user-mismatch-error';

export type ValidateIdempUserError = BackendIdempUserMismatchError;

export const zValidateIdempUserError = zBackendIdempUserMismatchError;

assertTypesEqual<
  ValidateIdempUserError,
  z.infer<typeof zValidateIdempUserError>
>({ value: true });
