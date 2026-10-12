import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';

export type GetMemberCheckIsEditorOrAdminError =
  | GetMemberCheckExistsError
  | BackendMemberIsNotEditorOrAdminError;

export let zGetMemberCheckIsEditorOrAdminError = z.union([
  zGetMemberCheckExistsError,
  zBackendMemberIsNotEditorOrAdminError
]);

assertTypesEqual<
  GetMemberCheckIsEditorOrAdminError,
  z.infer<typeof zGetMemberCheckIsEditorOrAdminError>
>({ value: true });
