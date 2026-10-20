import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionDoesNotExistError,
  zBackendConnectionDoesNotExistError
} from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import {
  type BackendConnectionSchemaIsNotFoundError,
  zBackendConnectionSchemaIsNotFoundError
} from '#common/types/backend/errors/backend-connection-schema-is-not-found-error';
import {
  type BackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionTypeIsNotSupportedForSampleError
} from '#common/types/backend/errors/backend-connection-type-is-not-supported-for-sample-error';
import {
  type BackendWrongColumnNameError,
  zBackendWrongColumnNameError
} from '#common/types/backend/errors/backend-wrong-column-name-error';
import {
  type BackendWrongOffsetError,
  zBackendWrongOffsetError
} from '#common/types/backend/errors/backend-wrong-offset-error';
import {
  type BackendWrongSchemaNameError,
  zBackendWrongSchemaNameError
} from '#common/types/backend/errors/backend-wrong-schema-name-error';
import {
  type BackendWrongTableNameError,
  zBackendWrongTableNameError
} from '#common/types/backend/errors/backend-wrong-table-name-error';
import {
  type DbConnectionsFindManyError,
  zDbConnectionsFindManyError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import {
  type DbProjectsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type GetMemberCheckIsEditorOrAdminError,
  zGetMemberCheckIsEditorOrAdminError
} from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';

export type GetConnectionSampleError =
  | DbProjectsFindFirstCheckExistsError
  | GetMemberCheckIsEditorOrAdminError
  | GetApiEnvsError
  | BackendWrongOffsetError
  | BackendConnectionDoesNotExistError
  | BackendConnectionTypeIsNotSupportedForSampleError
  | BackendConnectionSchemaIsNotFoundError
  | BackendWrongSchemaNameError
  | BackendWrongTableNameError
  | BackendWrongColumnNameError
  | DbConnectionsFindManyError;

export let zGetConnectionSampleError = z.union([
  zDbProjectsFindFirstCheckExistsError,
  zGetMemberCheckIsEditorOrAdminError,
  zGetApiEnvsError,
  zBackendWrongOffsetError,
  zBackendConnectionDoesNotExistError,
  zBackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionSchemaIsNotFoundError,
  zBackendWrongSchemaNameError,
  zBackendWrongTableNameError,
  zBackendWrongColumnNameError,
  zDbConnectionsFindManyError
]);

assertTypesEqual<
  GetConnectionSampleError,
  z.infer<typeof zGetConnectionSampleError>
>({ value: true });
