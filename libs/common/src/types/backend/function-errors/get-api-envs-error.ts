import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import {
  type EnvEntToTabError,
  zEnvEntToTabError
} from '#common/types/backend/function-errors/env-ent-to-tab-error';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';

export type GetApiEnvsError =
  | EnvEntToTabError
  | ConnectionEntToTabError
  | MemberEntToTabError;

export let zGetApiEnvsError = z.union([
  zEnvEntToTabError,
  zConnectionEntToTabError,
  zMemberEntToTabError
]);

assertTypesEqual<GetApiEnvsError, z.infer<typeof zGetApiEnvsError>>({
  value: true
});
