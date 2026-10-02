import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendAdminCannotChangeHisAdminStatusError,
  zBackendAdminCannotChangeHisAdminStatusError
} from '#common/types/backend/errors/backend-admin-cannot-change-his-admin-status-error';
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
  type BackendRolesDoNotExistError,
  zBackendRolesDoNotExistError
} from '#common/types/backend/errors/backend-roles-do-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';

export type ToBackendEditMemberError =
  | BackendAdminCannotChangeHisAdminStatusError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendRolesDoNotExistError
  | BackendTransactionRetryError;

export let zToBackendEditMemberError = z.discriminatedUnion('code', [
  zBackendAdminCannotChangeHisAdminStatusError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendRolesDoNotExistError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendEditMemberError,
  z.infer<typeof zToBackendEditMemberError>
>({ value: true });
