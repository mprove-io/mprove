import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BackendDatabricksFailedToCloseConnectionError,
  zBackendDatabricksFailedToCloseConnectionError
} from '#common/zod/backend/errors/backend-databricks-failed-to-close-connection-error';
import {
  type BackendFetchConstraintsBigqueryError,
  zBackendFetchConstraintsBigqueryError
} from '#common/zod/backend/errors/backend-fetch-constraints-bigquery-error';
import {
  type BackendFetchConstraintsDatabricksError,
  zBackendFetchConstraintsDatabricksError
} from '#common/zod/backend/errors/backend-fetch-constraints-databricks-error';
import {
  type BackendFetchConstraintsDuckdbError,
  zBackendFetchConstraintsDuckdbError
} from '#common/zod/backend/errors/backend-fetch-constraints-duckdb-error';
import {
  type BackendFetchConstraintsSnowflakeError,
  zBackendFetchConstraintsSnowflakeError
} from '#common/zod/backend/errors/backend-fetch-constraints-snowflake-error';
import {
  type BackendFetchDatasetBigqueryError,
  zBackendFetchDatasetBigqueryError
} from '#common/zod/backend/errors/backend-fetch-dataset-bigquery-error';
import {
  type BackendFetchFkBigqueryError,
  zBackendFetchFkBigqueryError
} from '#common/zod/backend/errors/backend-fetch-fk-bigquery-error';
import {
  type BackendFetchFkDatabricksError,
  zBackendFetchFkDatabricksError
} from '#common/zod/backend/errors/backend-fetch-fk-databricks-error';
import {
  type BackendFetchFkDuckdbError,
  zBackendFetchFkDuckdbError
} from '#common/zod/backend/errors/backend-fetch-fk-duckdb-error';
import {
  type BackendFetchFkMysqlError,
  zBackendFetchFkMysqlError
} from '#common/zod/backend/errors/backend-fetch-fk-mysql-error';
import {
  type BackendFetchFkPostgresError,
  zBackendFetchFkPostgresError
} from '#common/zod/backend/errors/backend-fetch-fk-postgres-error';
import {
  type BackendFetchFkSnowflakeError,
  zBackendFetchFkSnowflakeError
} from '#common/zod/backend/errors/backend-fetch-fk-snowflake-error';
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
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/zod/backend/errors/backend-struct-does-not-exist-error';

export type ToBackendGetConnectionSchemasError =
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendDatabricksFailedToCloseConnectionError
  | BackendFetchConstraintsBigqueryError
  | BackendFetchConstraintsDatabricksError
  | BackendFetchConstraintsDuckdbError
  | BackendFetchConstraintsSnowflakeError
  | BackendFetchDatasetBigqueryError
  | BackendFetchFkBigqueryError
  | BackendFetchFkDatabricksError
  | BackendFetchFkDuckdbError
  | BackendFetchFkMysqlError
  | BackendFetchFkPostgresError
  | BackendFetchFkSnowflakeError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorOrAdminError
  | BackendMysqlConnectionCloseError
  | BackendProjectDoesNotExistError
  | BackendSnowflakeFailedToDestroyConnectionError
  | BackendStructDoesNotExistError;

export let zToBackendGetConnectionSchemasError = z.discriminatedUnion('code', [
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendDatabricksFailedToCloseConnectionError,
  zBackendFetchConstraintsBigqueryError,
  zBackendFetchConstraintsDatabricksError,
  zBackendFetchConstraintsDuckdbError,
  zBackendFetchConstraintsSnowflakeError,
  zBackendFetchDatasetBigqueryError,
  zBackendFetchFkBigqueryError,
  zBackendFetchFkDatabricksError,
  zBackendFetchFkDuckdbError,
  zBackendFetchFkMysqlError,
  zBackendFetchFkPostgresError,
  zBackendFetchFkSnowflakeError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendMysqlConnectionCloseError,
  zBackendProjectDoesNotExistError,
  zBackendSnowflakeFailedToDestroyConnectionError,
  zBackendStructDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetConnectionSchemasError,
  z.infer<typeof zToBackendGetConnectionSchemasError>
>({ value: true });
