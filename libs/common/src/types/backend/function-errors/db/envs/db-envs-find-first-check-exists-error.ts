import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/types/backend/errors/backend-env-does-not-exist-error';
import {
  type EnvEntToTabError,
  zEnvEntToTabError
} from '#common/types/backend/function-errors/env-ent-to-tab-error';

export type DbEnvsFindFirstCheckExistsError =
  | EnvEntToTabError
  | BackendEnvDoesNotExistError;

export let zDbEnvsFindFirstCheckExistsError = z.union([
  zEnvEntToTabError,
  zBackendEnvDoesNotExistError
]);

assertTypesEqual<
  DbEnvsFindFirstCheckExistsError,
  z.infer<typeof zDbEnvsFindFirstCheckExistsError>
>({
  value: true
});
