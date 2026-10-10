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
  type ConnectionEntToTabResultError,
  zConnectionEntToTabResultError
} from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import {
  type GetApiEnvsResultError,
  zGetApiEnvsResultError
} from '#common/types/backend/function-errors/get-api-envs-result-error';
import {
  type GetMemberCheckIsEditorOrAdminResultError,
  zGetMemberCheckIsEditorOrAdminResultError
} from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import {
  type GetProjectCheckExistsResultError,
  zGetProjectCheckExistsResultError
} from '#common/types/backend/function-errors/get-project-check-exists-result-error';

export type GetConnectionSampleResultError =
  | GetProjectCheckExistsResultError
  | GetMemberCheckIsEditorOrAdminResultError
  | GetApiEnvsResultError
  | ConnectionEntToTabResultError
  | BackendWrongOffsetError
  | BackendConnectionDoesNotExistError
  | BackendConnectionTypeIsNotSupportedForSampleError
  | BackendConnectionSchemaIsNotFoundError
  | BackendWrongSchemaNameError
  | BackendWrongTableNameError
  | BackendWrongColumnNameError;

export let zGetConnectionSampleResultError = z.union([
  zGetProjectCheckExistsResultError,
  zGetMemberCheckIsEditorOrAdminResultError,
  zGetApiEnvsResultError,
  zConnectionEntToTabResultError,
  zBackendWrongOffsetError,
  zBackendConnectionDoesNotExistError,
  zBackendConnectionTypeIsNotSupportedForSampleError,
  zBackendConnectionSchemaIsNotFoundError,
  zBackendWrongSchemaNameError,
  zBackendWrongTableNameError,
  zBackendWrongColumnNameError
]);

assertTypesEqual<
  GetConnectionSampleResultError,
  z.infer<typeof zGetConnectionSampleResultError>
>({ value: true });
