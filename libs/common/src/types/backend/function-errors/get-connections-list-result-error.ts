import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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

export type GetConnectionsListResultError =
  | GetProjectCheckExistsResultError
  | GetMemberCheckIsEditorOrAdminResultError
  | GetApiEnvsResultError
  | ConnectionEntToTabResultError;

export let zGetConnectionsListResultError = z.union([
  zGetProjectCheckExistsResultError,
  zGetMemberCheckIsEditorOrAdminResultError,
  zGetApiEnvsResultError,
  zConnectionEntToTabResultError
]);

assertTypesEqual<
  GetConnectionsListResultError,
  z.infer<typeof zGetConnectionsListResultError>
>({ value: true });
