import type { BackendMemberIsNotEditorOrAdminError } from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';

export type GetMemberCheckIsEditorOrAdminResultError =
  | GetMemberCheckExistsResultError
  | BackendMemberIsNotEditorOrAdminError;
