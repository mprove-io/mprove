import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/types/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/types/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type DbEnvsFindFirstError,
  zDbEnvsFindFirstError
} from '#common/types/backend/function-errors/db/envs/db-envs-find-first-error';

export type GetEnvCheckExistsAndAccessError =
  | BackendEnvDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | DbEnvsFindFirstError;

export let zGetEnvCheckExistsAndAccessError = z.union([
  zBackendEnvDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zDbEnvsFindFirstError
]);

assertTypesEqual<
  GetEnvCheckExistsAndAccessError,
  z.infer<typeof zGetEnvCheckExistsAndAccessError>
>({ value: true });
