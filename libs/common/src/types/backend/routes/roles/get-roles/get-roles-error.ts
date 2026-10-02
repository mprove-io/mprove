import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';

export type ToBackendGetRolesError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError;

export let zToBackendGetRolesError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetRolesError,
  z.infer<typeof zToBackendGetRolesError>
>({ value: true });
