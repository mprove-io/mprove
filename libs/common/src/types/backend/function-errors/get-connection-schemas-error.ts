import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbBridgesFindFirstCheckExistsError,
  zDbBridgesFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-check-exists-error';
import {
  type DbCachedColumnsFindManyError,
  zDbCachedColumnsFindManyError
} from '#common/types/backend/function-errors/db/cached-columns/db-cached-columns-find-many-error';
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
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';

export type GetConnectionSchemasError =
  | DbProjectsFindFirstCheckExistsError
  | GetMemberCheckIsEditorOrAdminError
  | GetApiEnvsError
  | DbBridgesFindFirstCheckExistsError
  | GetStructCheckExistsError
  | DbConnectionsFindManyError
  | DbCachedColumnsFindManyError;

export let zGetConnectionSchemasError = z.union([
  zDbProjectsFindFirstCheckExistsError,
  zGetMemberCheckIsEditorOrAdminError,
  zGetApiEnvsError,
  zDbBridgesFindFirstCheckExistsError,
  zGetStructCheckExistsError,
  zDbConnectionsFindManyError,
  zDbCachedColumnsFindManyError
]);

assertTypesEqual<
  GetConnectionSchemasError,
  z.infer<typeof zGetConnectionSchemasError>
>({ value: true });
