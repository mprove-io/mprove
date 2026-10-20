import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type EnvEntToTabError,
  zEnvEntToTabError
} from '#common/types/backend/function-errors/env-ent-to-tab-error';

export type DbEnvsFindManyError = EnvEntToTabError;

export let zDbEnvsFindManyError = zEnvEntToTabError;

assertTypesEqual<DbEnvsFindManyError, z.infer<typeof zDbEnvsFindManyError>>({
  value: true
});
