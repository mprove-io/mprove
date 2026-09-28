import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendMemberIsNotEditorOrAdminError,
  zBackendMemberIsNotEditorOrAdminError
} from '#common/zod/backend/errors/backend-member-is-not-editor-or-admin-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendWrongOffsetError,
  zBackendWrongOffsetError
} from '#common/zod/backend/errors/backend-wrong-offset-error';

export type ToBackendViewCachedColumnError =
  | BackendEnvDoesNotExistError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotEditorOrAdminError
  | BackendProjectDoesNotExistError
  | BackendWrongOffsetError;

export let zToBackendViewCachedColumnError = z.discriminatedUnion('code', [
  zBackendEnvDoesNotExistError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotEditorOrAdminError,
  zBackendProjectDoesNotExistError,
  zBackendWrongOffsetError
]);

assertTypesEqual<
  ToBackendViewCachedColumnError,
  z.infer<typeof zToBackendViewCachedColumnError>
>({ value: true });
