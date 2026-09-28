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
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
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
  type BackendWrongOffsetError,
  zBackendWrongOffsetError
} from '#common/zod/backend/errors/backend-wrong-offset-error';
import {
  type BackendWrongSchemaNameError,
  zBackendWrongSchemaNameError
} from '#common/zod/backend/errors/backend-wrong-schema-name-error';
import {
  type BackendWrongTableNameError,
  zBackendWrongTableNameError
} from '#common/zod/backend/errors/backend-wrong-table-name-error';

export type ToBackendGetConnectionSampleError =
  | BackendConnectionDoesNotExistError
  | BackendConnectionSchemaIsNotFoundError
  | BackendConnectionTypeIsNotSupportedForSampleError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMysqlConnectionCloseError
  | BackendProjectDoesNotExistError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendWrongColumnNameError
  | BackendWrongOffsetError
  | BackendWrongSchemaNameError
  | BackendWrongTableNameError;

export let zToBackendGetConnectionSampleError = z.discriminatedUnion('code', [
  zBackendConnectionDoesNotExistError,
  zBackendConnectionSchemaIsNotFoundError,
  zBackendConnectionTypeIsNotSupportedForSampleError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendMysqlConnectionCloseError,
  zBackendProjectDoesNotExistError,
  zBackendSnowflakeFailedToDestroyConnectionError,
  zBackendWrongColumnNameError,
  zBackendWrongOffsetError,
  zBackendWrongSchemaNameError,
  zBackendWrongTableNameError
]);

assertTypesEqual<
  ToBackendGetConnectionSampleError,
  z.infer<typeof zToBackendGetConnectionSampleError>
>({ value: true });
