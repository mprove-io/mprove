import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendRestrictedUserError,
  zBackendRestrictedUserError
} from '#common/types/backend/errors/backend-restricted-user-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendUserAliasIsUndefinedError,
  zBackendUserAliasIsUndefinedError
} from '#common/types/backend/errors/backend-user-alias-is-undefined-error';
import {
  type BackendUserAlreadyRegisteredError,
  zBackendUserAlreadyRegisteredError
} from '#common/types/backend/errors/backend-user-already-registered-error';
import {
  type BackendUserIsNotInvitedError,
  zBackendUserIsNotInvitedError
} from '#common/types/backend/errors/backend-user-is-not-invited-error';

export type ToBackendRegisterUserError =
  | BackendHashSecretIsNotDefinedError
  | BackendRestrictedUserError
  | BackendTransactionRetryError
  | BackendUserAliasIsUndefinedError
  | BackendUserAlreadyRegisteredError
  | BackendUserIsNotInvitedError;

export let zToBackendRegisterUserError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendRestrictedUserError,
  zBackendTransactionRetryError,
  zBackendUserAliasIsUndefinedError,
  zBackendUserAlreadyRegisteredError,
  zBackendUserIsNotInvitedError
]);

assertTypesEqual<
  ToBackendRegisterUserError,
  z.infer<typeof zToBackendRegisterUserError>
>({ value: true });
