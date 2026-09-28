import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
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

export type ToBackendGenerateProjectRemoteKeyError =
  | BackendHashSecretIsNotDefinedError
  | BackendOnlyOrgOwnerCanAccessError
  | BackendOrgDoesNotExistError
  | BackendTransactionRetryError;

export let zToBackendGenerateProjectRemoteKeyError = z.discriminatedUnion(
  'code',
  [
    zBackendHashSecretIsNotDefinedError,
    zBackendOnlyOrgOwnerCanAccessError,
    zBackendOrgDoesNotExistError,
    zBackendTransactionRetryError
  ]
);

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyError,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyError>
>({ value: true });
