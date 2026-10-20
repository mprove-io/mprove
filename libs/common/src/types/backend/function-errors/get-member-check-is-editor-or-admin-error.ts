import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';

export type GetMemberCheckIsEditorOrAdminError =
  | DbMembersFindFirstCheckExistsError
  | BackendMemberIsNotEditorOrAdminError;

export let zGetMemberCheckIsEditorOrAdminError = z.union([
  zDbMembersFindFirstCheckExistsError,
  zBackendMemberIsNotEditorOrAdminError
]);

assertTypesEqual<
  GetMemberCheckIsEditorOrAdminError,
  z.infer<typeof zGetMemberCheckIsEditorOrAdminError>
>({ value: true });
