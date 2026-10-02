import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvProdCannotBeDeletedError,
  zBackendEnvProdCannotBeDeletedError
} from '#common/types/backend/errors/backend-env-prod-cannot-be-deleted-error';
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
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';

export type ToBackendDeleteEnvError =
  | BackendEnvProdCannotBeDeletedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendTransactionRetryError;

export let zToBackendDeleteEnvError = z.discriminatedUnion('code', [
  zBackendEnvProdCannotBeDeletedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendDeleteEnvError,
  z.infer<typeof zToBackendDeleteEnvError>
>({ value: true });
