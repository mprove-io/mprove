import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendGivenAlreadyExistsError,
  zBackendGivenAlreadyExistsError
} from '#common/types/backend/errors/backend-given-already-exists-error';
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
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';
import {
  type BackendWrongGivenValueError,
  zBackendWrongGivenValueError
} from '#common/types/backend/errors/backend-wrong-given-value-error';

export type ToBackendCreateGivenError =
  | BackendGivenAlreadyExistsError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendTransactionRetryError
  | BackendWrongGivenValueError;

export let zToBackendCreateGivenError = z.discriminatedUnion('code', [
  zBackendGivenAlreadyExistsError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendTransactionRetryError,
  zBackendWrongGivenValueError
]);

assertTypesEqual<
  ToBackendCreateGivenError,
  z.infer<typeof zToBackendCreateGivenError>
>({ value: true });
