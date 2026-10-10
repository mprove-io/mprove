import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type GetMemberCheckExistsResultError,
  zGetMemberCheckExistsResultError
} from '#common/types/backend/function-errors/get-member-check-exists-result-error';

export type GetMemberCheckIsEditorOrAdminResultError =
  | GetMemberCheckExistsResultError
  | BackendMemberIsNotEditorOrAdminError;

export let zGetMemberCheckIsEditorOrAdminResultError = z.union([
  zGetMemberCheckExistsResultError,
  zBackendMemberIsNotEditorOrAdminError
]);

assertTypesEqual<
  GetMemberCheckIsEditorOrAdminResultError,
  z.infer<typeof zGetMemberCheckIsEditorOrAdminResultError>
>({ value: true });
