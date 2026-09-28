import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/zod/backend/errors/backend-restricted-project-error';

export type ToBackendGetMembersError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError
  | BackendRestrictedProjectError;

export let zToBackendGetMembersError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError,
  zBackendRestrictedProjectError
]);

assertTypesEqual<
  ToBackendGetMembersError,
  z.infer<typeof zToBackendGetMembersError>
>({ value: true });
