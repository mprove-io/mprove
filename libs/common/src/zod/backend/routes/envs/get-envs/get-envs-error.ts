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

export type ToBackendGetEnvsError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError;

export let zToBackendGetEnvsError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<ToBackendGetEnvsError, z.infer<typeof zToBackendGetEnvsError>>(
  { value: true }
);
