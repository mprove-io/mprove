import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumnEntToTabResultError,
  zCachedColumnEntToTabResultError
} from '#common/types/backend/function-errors/cached-column-ent-to-tab-result-error';
import {
  type ConnectionEntToTabResultError,
  zConnectionEntToTabResultError
} from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import {
  type GetApiEnvsResultError,
  zGetApiEnvsResultError
} from '#common/types/backend/function-errors/get-api-envs-result-error';
import {
  type GetBridgeCheckExistsResultError,
  zGetBridgeCheckExistsResultError
} from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import {
  type GetMemberCheckIsEditorOrAdminResultError,
  zGetMemberCheckIsEditorOrAdminResultError
} from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import {
  type GetProjectCheckExistsResultError,
  zGetProjectCheckExistsResultError
} from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import {
  type GetStructCheckExistsResultError,
  zGetStructCheckExistsResultError
} from '#common/types/backend/function-errors/get-struct-check-exists-result-error';

export type GetConnectionSchemasResultError =
  | GetProjectCheckExistsResultError
  | GetMemberCheckIsEditorOrAdminResultError
  | GetApiEnvsResultError
  | GetBridgeCheckExistsResultError
  | GetStructCheckExistsResultError
  | ConnectionEntToTabResultError
  | CachedColumnEntToTabResultError;

export let zGetConnectionSchemasResultError = z.union([
  zGetProjectCheckExistsResultError,
  zGetMemberCheckIsEditorOrAdminResultError,
  zGetApiEnvsResultError,
  zGetBridgeCheckExistsResultError,
  zGetStructCheckExistsResultError,
  zConnectionEntToTabResultError,
  zCachedColumnEntToTabResultError
]);

assertTypesEqual<
  GetConnectionSchemasResultError,
  z.infer<typeof zGetConnectionSchemasResultError>
>({ value: true });
