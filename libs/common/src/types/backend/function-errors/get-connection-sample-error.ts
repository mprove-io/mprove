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
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type GetMemberCheckIsEditorOrAdminError,
  zGetMemberCheckIsEditorOrAdminError
} from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';

export type GetConnectionSampleError =
  | GetProjectCheckExistsError
  | GetMemberCheckIsEditorOrAdminError
  | GetApiEnvsError
  | ConnectionEntToTabError
  | BackendWrongOffsetError
  | BackendConnectionDoesNotExistError
  | BackendConnectionTypeIsNotSupportedForSampleError
  | BackendConnectionSchemaIsNotFoundError
  | BackendWrongSchemaNameError
  | BackendWrongTableNameError
  | BackendWrongColumnNameError;

export let zGetConnectionSampleError = z.union([
  zGetProjectCheckExistsError,
  zGetMemberCheckIsEditorOrAdminError,
  zGetApiEnvsError,
  zConnectionEntToTabError,
  zBackendWrongOffsetError,
  zBackendConnectionDoesNotExistError,
  zBackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionSchemaIsNotFoundError,
  zBackendWrongSchemaNameError,
  zBackendWrongTableNameError,
  zBackendWrongColumnNameError
]);

assertTypesEqual<
  GetConnectionSampleError,
  z.infer<typeof zGetConnectionSampleError>
>({ value: true });
