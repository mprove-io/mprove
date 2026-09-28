import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/zod/backend/errors/backend-session-not-found-error';

export type ToBackendCloseExplorerSessionTabError =
  | BackendHashSecretIsNotDefinedError
  | BackendSessionNotFoundError;

export let zToBackendCloseExplorerSessionTabError = z.discriminatedUnion(
  'code',
  [zBackendHashSecretIsNotDefinedError, zBackendSessionNotFoundError]
);

assertTypesEqual<
  ToBackendCloseExplorerSessionTabError,
  z.infer<typeof zToBackendCloseExplorerSessionTabError>
>({ value: true });
