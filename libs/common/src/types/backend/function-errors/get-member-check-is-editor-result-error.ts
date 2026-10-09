import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotEditorError,
  zBackendMemberIsNotEditorError
} from '#common/types/backend/errors/backend-member-is-not-editor-error';
import {
  type GetMemberCheckExistsResultError,
  zGetMemberCheckExistsResultError
} from '#common/types/backend/function-errors/get-member-check-exists-result-error';

export type GetMemberCheckIsEditorResultError =
  | GetMemberCheckExistsResultError
  | BackendMemberIsNotEditorError;

export let zGetMemberCheckIsEditorResultError = z.union([
  zGetMemberCheckExistsResultError,
  zBackendMemberIsNotEditorError
]);

assertTypesEqual<
  GetMemberCheckIsEditorResultError,
  z.infer<typeof zGetMemberCheckIsEditorResultError>
>({ value: true });
