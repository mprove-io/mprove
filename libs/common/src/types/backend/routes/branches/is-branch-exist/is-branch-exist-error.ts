import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/types/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/types/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';

export type ToBackendIsBranchExistError =
  | BackendForbiddenRepoIdError
  | BackendMemberDoesNotExistError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError;

export let zToBackendIsBranchExistError = z.discriminatedUnion('code', [
  zBackendForbiddenRepoIdError,
  zBackendMemberDoesNotExistError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError
]);

assertTypesEqual<
  ToBackendIsBranchExistError,
  z.infer<typeof zToBackendIsBranchExistError>
>({ value: true });
