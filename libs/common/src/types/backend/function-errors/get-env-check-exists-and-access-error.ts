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
  type EnvEntToTabError,
  zEnvEntToTabError
} from '#common/types/backend/function-errors/env-ent-to-tab-error';

export type GetEnvCheckExistsAndAccessError =
  | BackendEnvDoesNotExistError
  | EnvEntToTabError
  | BackendMemberDoesNotHaveAccessToEnvError;

export let zGetEnvCheckExistsAndAccessError = z.union([
  zBackendEnvDoesNotExistError,
  zEnvEntToTabError,
  zBackendMemberDoesNotHaveAccessToEnvError
]);

assertTypesEqual<
  GetEnvCheckExistsAndAccessError,
  z.infer<typeof zGetEnvCheckExistsAndAccessError>
>({ value: true });
