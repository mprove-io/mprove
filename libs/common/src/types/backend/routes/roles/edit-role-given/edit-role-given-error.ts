import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGivenDoesNotExistError,
  zBackendGivenDoesNotExistError
} from '#common/types/backend/errors/backend-given-does-not-exist-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendRoleDoesNotExistError,
  zBackendRoleDoesNotExistError
} from '#common/types/backend/errors/backend-role-does-not-exist-error';
import {
  type BackendRoleGivenDoesNotExistError,
  zBackendRoleGivenDoesNotExistError
} from '#common/types/backend/errors/backend-role-given-does-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongGivenValueError,
  zBackendWrongGivenValueError
} from '#common/types/backend/errors/backend-wrong-given-value-error';

export type ToBackendEditRoleGivenError =
  | BackendGivenDoesNotExistError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendRoleDoesNotExistError
  | BackendRoleGivenDoesNotExistError
  | BackendTransactionRetryError
  | BackendWrongGivenValueError;

export let zToBackendEditRoleGivenError = z.discriminatedUnion('code', [
  zBackendGivenDoesNotExistError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendRoleDoesNotExistError,
  zBackendRoleGivenDoesNotExistError,
  zBackendTransactionRetryError,
  zBackendWrongGivenValueError
]);

assertTypesEqual<
  ToBackendEditRoleGivenError,
  z.infer<typeof zToBackendEditRoleGivenError>
>({ value: true });
