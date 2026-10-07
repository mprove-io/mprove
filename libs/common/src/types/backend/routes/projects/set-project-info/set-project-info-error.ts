import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { BackendCommonError } from '#common/types/backend/errors/backend-common-error';
import { zBackendHashSecretIsNotDefinedError } from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import { zBackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import { zBackendMemberIsNotAdminError } from '#common/types/backend/errors/backend-member-is-not-admin-error';
import { zBackendProjectDoesNotExistError } from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import type { SetProjectInfoError } from '#common/types/backend/function-errors/set-project-info-error';

export type ToBackendSetProjectInfoError =
  | Exclude<SetProjectInfoError, BackendCommonError>
  | BackendTransactionRetryError;

export let zToBackendSetProjectInfoError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendSetProjectInfoError,
  z.infer<typeof zToBackendSetProjectInfoError>
>({ value: true });
