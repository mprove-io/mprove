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

export type ToBackendGetEnvsListError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError;

export let zToBackendGetEnvsListError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetEnvsListError,
  z.infer<typeof zToBackendGetEnvsListError>
>({ value: true });
