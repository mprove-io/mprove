import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendLlmModelDoesNotExistError,
  zBackendLlmModelDoesNotExistError
} from '#common/types/backend/errors/backend-llm-model-does-not-exist-error';
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
  type BackendProviderDoesNotExistError,
  zBackendProviderDoesNotExistError
} from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/types/backend/errors/backend-transaction-retry-error';

export type ToBackendDeleteLlmModelError =
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendProviderDoesNotExistError
  | BackendLlmModelDoesNotExistError
  | BackendTransactionRetryError;

export let zToBackendDeleteLlmModelError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendProviderDoesNotExistError,
  zBackendLlmModelDoesNotExistError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendDeleteLlmModelError,
  z.infer<typeof zToBackendDeleteLlmModelError>
>({ value: true });
