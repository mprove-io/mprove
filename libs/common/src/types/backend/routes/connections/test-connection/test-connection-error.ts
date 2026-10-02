import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendDatabricksFailedToCloseConnectionError,
  zBackendDatabricksFailedToCloseConnectionError
} from '#common/types/backend/errors/backend-databricks-failed-to-close-connection-error';
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
  type BackendTestConnectionResultIsNotDefinedError,
  zBackendTestConnectionResultIsNotDefinedError
} from '#common/types/backend/errors/backend-test-connection-result-is-not-defined-error';
import {
  type BackendWrongMotherduckDatabaseCharactersError,
  zBackendWrongMotherduckDatabaseCharactersError
} from '#common/types/backend/errors/backend-wrong-motherduck-database-characters-error';

export type ToBackendTestConnectionError =
  | BackendDatabricksFailedToCloseConnectionError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError
  | BackendProjectDoesNotExistError
  | BackendTestConnectionResultIsNotDefinedError
  | BackendWrongMotherduckDatabaseCharactersError;

export let zToBackendTestConnectionError = z.discriminatedUnion('code', [
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError,
  zBackendProjectDoesNotExistError,
  zBackendTestConnectionResultIsNotDefinedError,
  zBackendWrongMotherduckDatabaseCharactersError
]);

assertTypesEqual<
  ToBackendTestConnectionError,
  z.infer<typeof zToBackendTestConnectionError>
>({ value: true });
