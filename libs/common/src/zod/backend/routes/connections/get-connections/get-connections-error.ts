import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/zod/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';

export type ToBackendGetConnectionsError =
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotEditorOrAdminError
  | BackendProjectDoesNotExistError;

export let zToBackendGetConnectionsError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetConnectionsError,
  z.infer<typeof zToBackendGetConnectionsError>
>({ value: true });
