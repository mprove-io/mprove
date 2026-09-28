import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendNewOwnerNotFoundError,
  zBackendNewOwnerNotFoundError
} from '#common/zod/backend/errors/backend-new-owner-not-found-error';
import {
  type BackendOnlyOrgOwnerCanAccessError,
  zBackendOnlyOrgOwnerCanAccessError
} from '#common/zod/backend/errors/backend-only-org-owner-can-access-error';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/zod/backend/errors/backend-org-does-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';

export type ToBackendSetOrgOwnerError =
  | BackendHashSecretIsNotDefinedError
  | BackendNewOwnerNotFoundError
  | BackendOnlyOrgOwnerCanAccessError
  | BackendOrgDoesNotExistError
  | BackendTransactionRetryError;

export let zToBackendSetOrgOwnerError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendNewOwnerNotFoundError,
  zBackendOnlyOrgOwnerCanAccessError,
  zBackendOrgDoesNotExistError,
  zBackendTransactionRetryError
]);

assertTypesEqual<
  ToBackendSetOrgOwnerError,
  z.infer<typeof zToBackendSetOrgOwnerError>
>({ value: true });
