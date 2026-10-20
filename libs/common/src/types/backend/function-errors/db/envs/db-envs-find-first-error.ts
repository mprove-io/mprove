import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type EnvEntToTabError,
  zEnvEntToTabError
} from '#common/types/backend/function-errors/env-ent-to-tab-error';

export type DbEnvsFindFirstError = EnvEntToTabError;

export let zDbEnvsFindFirstError = zEnvEntToTabError;

assertTypesEqual<DbEnvsFindFirstError, z.infer<typeof zDbEnvsFindFirstError>>({
  value: true
});
