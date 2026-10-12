import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumnEntToTabError,
  zCachedColumnEntToTabError
} from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type GetBridgeCheckExistsError,
  zGetBridgeCheckExistsError
} from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import {
  type GetMemberCheckIsEditorOrAdminError,
  zGetMemberCheckIsEditorOrAdminError
} from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';

export type GetConnectionSchemasError =
  | GetProjectCheckExistsError
  | GetMemberCheckIsEditorOrAdminError
  | GetApiEnvsError
  | GetBridgeCheckExistsError
  | GetStructCheckExistsError
  | ConnectionEntToTabError
  | CachedColumnEntToTabError;

export let zGetConnectionSchemasError = z.union([
  zGetProjectCheckExistsError,
  zGetMemberCheckIsEditorOrAdminError,
  zGetApiEnvsError,
  zGetBridgeCheckExistsError,
  zGetStructCheckExistsError,
  zConnectionEntToTabError,
  zCachedColumnEntToTabError
]);

assertTypesEqual<
  GetConnectionSchemasError,
  z.infer<typeof zGetConnectionSchemasError>
>({ value: true });
