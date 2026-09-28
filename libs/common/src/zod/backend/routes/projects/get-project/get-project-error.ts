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

export type ToBackendGetProjectError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError;

export let zToBackendGetProjectError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetProjectError,
  z.infer<typeof zToBackendGetProjectError>
>({ value: true });
