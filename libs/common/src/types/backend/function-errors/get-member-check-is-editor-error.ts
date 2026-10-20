import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/types/backend/errors/backend-member-is-not-editor-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';

export type GetMemberCheckIsEditorError =
  | DbMembersFindFirstCheckExistsError
  | BackendMemberIsNotEditorError;

export let zGetMemberCheckIsEditorError = z.union([
  zDbMembersFindFirstCheckExistsError,
  zBackendMemberIsNotEditorError
]);

assertTypesEqual<
  GetMemberCheckIsEditorError,
  z.infer<typeof zGetMemberCheckIsEditorError>
>({ value: true });
