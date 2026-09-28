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

export type ToBackendGetMemberGivensError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError;

export let zToBackendGetMemberGivensError = z.discriminatedUnion('code', [
  zBackendMemberDoesNotExistError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendGetMemberGivensError,
  z.infer<typeof zToBackendGetMemberGivensError>
>({ value: true });
