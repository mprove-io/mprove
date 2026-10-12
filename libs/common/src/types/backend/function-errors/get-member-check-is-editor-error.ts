import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/types/backend/errors/backend-member-is-not-editor-error';
import {
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';

export type GetMemberCheckIsEditorError =
  | GetMemberCheckExistsError
  | BackendMemberIsNotEditorError;

export let zGetMemberCheckIsEditorError = z.union([
  zGetMemberCheckExistsError,
  zBackendMemberIsNotEditorError
]);

assertTypesEqual<
  GetMemberCheckIsEditorError,
  z.infer<typeof zGetMemberCheckIsEditorError>
>({ value: true });
