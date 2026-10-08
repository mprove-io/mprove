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
  type EnvEntToTabResultError,
  zEnvEntToTabResultError
} from '#common/types/backend/function-errors/env-ent-to-tab-result-error';

export type GetEnvCheckExistsAndAccessResultError =
  | BackendEnvDoesNotExistError
  | EnvEntToTabResultError
  | BackendMemberDoesNotHaveAccessToEnvError;

export let zGetEnvCheckExistsAndAccessResultError = z.union([
  zBackendEnvDoesNotExistError,
  zEnvEntToTabResultError,
  zBackendMemberDoesNotHaveAccessToEnvError
]);

assertTypesEqual<
  GetEnvCheckExistsAndAccessResultError,
  z.infer<typeof zGetEnvCheckExistsAndAccessResultError>
>({ value: true });
