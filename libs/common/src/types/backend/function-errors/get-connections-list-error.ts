import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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

export type GetConnectionsListError =
  | DbProjectsFindFirstCheckExistsError
  | GetMemberCheckIsEditorOrAdminError
  | GetApiEnvsError
  | DbConnectionsFindManyError;

export let zGetConnectionsListError = z.union([
  zDbProjectsFindFirstCheckExistsError,
  zGetMemberCheckIsEditorOrAdminError,
  zGetApiEnvsError,
  zDbConnectionsFindManyError
]);

assertTypesEqual<
  GetConnectionsListError,
  z.infer<typeof zGetConnectionsListError>
>({ value: true });
