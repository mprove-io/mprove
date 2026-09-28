import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/zod/backend/errors/backend-connection-does-not-exist-error';
import {
  type BackendConnectionSchemaIsNotFoundError,
  zBackendConnectionSchemaIsNotFoundError
} from '#common/zod/backend/errors/backend-connection-schema-is-not-found-error';
import {
  type BackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionTypeIsNotSupportedForSampleError
} from '#common/zod/backend/errors/backend-connection-type-is-not-supported-for-sample-error';
import {
  type BackendDatabricksFailedToCloseConnectionError,
  zBackendDatabricksFailedToCloseConnectionError
} from '#common/zod/backend/errors/backend-databricks-failed-to-close-connection-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/zod/backend/errors/backend-member-is-not-admin-error';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/zod/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendMysqlConnectionCloseError,
  zBackendMysqlConnectionCloseError
} from '#common/zod/backend/errors/backend-mysql-connection-close-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendSnowflakeFailedToDestroyConnectionError,
  zBackendSnowflakeFailedToDestroyConnectionError
} from '#common/zod/backend/errors/backend-snowflake-failed-to-destroy-connection-error';
import {
  type BackendWrongColumnNameError,
  zBackendWrongColumnNameError
} from '#common/zod/backend/errors/backend-wrong-column-name-error';
import {
  type BackendWrongSchemaNameError,
  zBackendWrongSchemaNameError
} from '#common/zod/backend/errors/backend-wrong-schema-name-error';
import {
  type BackendWrongTableNameError,
  zBackendWrongTableNameError
} from '#common/zod/backend/errors/backend-wrong-table-name-error';

export type ToBackendRefreshCachedColumnError =
  | BackendConnectionDoesNotExistError
  | BackendConnectionSchemaIsNotFoundError
  | BackendConnectionTypeIsNotSupportedForSampleError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendEnvDoesNotExistError
  | BackendHashSecretIsNotDefinedError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotAdminError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMysqlConnectionCloseError
  | BackendProjectDoesNotExistError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendWrongColumnNameError
  | BackendWrongSchemaNameError
  | BackendWrongTableNameError;

export let zToBackendRefreshCachedColumnError = z.discriminatedUnion('code', [
  zBackendConnectionDoesNotExistError,
  zBackendConnectionSchemaIsNotFoundError,
  zBackendConnectionTypeIsNotSupportedForSampleError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendEnvDoesNotExistError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotAdminError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendMysqlConnectionCloseError,
  zBackendProjectDoesNotExistError,
  zBackendSnowflakeFailedToDestroyConnectionError,
  zBackendWrongColumnNameError,
  zBackendWrongSchemaNameError,
  zBackendWrongTableNameError
]);

assertTypesEqual<
  ToBackendRefreshCachedColumnError,
  z.infer<typeof zToBackendRefreshCachedColumnError>
>({ value: true });
