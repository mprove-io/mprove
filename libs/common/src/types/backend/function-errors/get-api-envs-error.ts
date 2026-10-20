import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbConnectionsFindManyError,
  zDbConnectionsFindManyError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import {
  type DbEnvsFindManyError,
  zDbEnvsFindManyError
} from '#common/types/backend/function-errors/db/envs/db-envs-find-many-error';
import {
  type DbMembersFindManyError,
  zDbMembersFindManyError
} from '#common/types/backend/function-errors/db/members/db-members-find-many-error';

export type GetApiEnvsError =
  | DbEnvsFindManyError
  | DbConnectionsFindManyError
  | DbMembersFindManyError;

export let zGetApiEnvsError = z.union([
  zDbEnvsFindManyError,
  zDbConnectionsFindManyError,
  zDbMembersFindManyError
]);

assertTypesEqual<GetApiEnvsError, z.infer<typeof zGetApiEnvsError>>({
  value: true
});
