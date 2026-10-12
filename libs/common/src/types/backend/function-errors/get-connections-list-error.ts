import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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

export type GetConnectionsListError =
  | GetProjectCheckExistsError
  | GetMemberCheckIsEditorOrAdminError
  | GetApiEnvsError
  | ConnectionEntToTabError;

export let zGetConnectionsListError = z.union([
  zGetProjectCheckExistsError,
  zGetMemberCheckIsEditorOrAdminError,
  zGetApiEnvsError,
  zConnectionEntToTabError
]);

assertTypesEqual<
  GetConnectionsListError,
  z.infer<typeof zGetConnectionsListError>
>({ value: true });
