import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';

export type ToBackendGetGivensError =
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorOrAdminError
  | BackendProjectDoesNotExistError;

export let zToBackendGetGivensError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetGivensError,
  z.infer<typeof zToBackendGetGivensError>
>({ value: true });
