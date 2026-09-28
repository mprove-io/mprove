import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/zod/backend/errors/backend-restricted-user-error';

export type ToBackendResendUserEmailError = BackendRestrictedUserError;

export let zToBackendResendUserEmailError = zBackendRestrictedUserError;

assertTypesEqual<
  ToBackendResendUserEmailError,
  z.infer<typeof zToBackendResendUserEmailError>
>({ value: true });
