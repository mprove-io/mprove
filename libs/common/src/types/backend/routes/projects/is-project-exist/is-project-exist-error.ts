import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/types/backend/errors/backend-org-does-not-exist-error';

export type ToBackendIsProjectExistError =
  | BackendHashSecretIsNotDefinedError
  | BackendOrgDoesNotExistError;

export let zToBackendIsProjectExistError = z.discriminatedUnion('code', [
  zBackendHashSecretIsNotDefinedError,
  zBackendOrgDoesNotExistError
]);

assertTypesEqual<
  ToBackendIsProjectExistError,
  z.infer<typeof zToBackendIsProjectExistError>
>({ value: true });
