import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabResultError,
  zConnectionEntToTabResultError
} from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import {
  type EnvEntToTabResultError,
  zEnvEntToTabResultError
} from '#common/types/backend/function-errors/env-ent-to-tab-result-error';
import {
  type MemberEntToTabResultError,
  zMemberEntToTabResultError
} from '#common/types/backend/function-errors/member-ent-to-tab-result-error';

export type GetApiEnvsResultError =
  | EnvEntToTabResultError
  | ConnectionEntToTabResultError
  | MemberEntToTabResultError;

export let zGetApiEnvsResultError = z.union([
  zEnvEntToTabResultError,
  zConnectionEntToTabResultError,
  zMemberEntToTabResultError
]);

assertTypesEqual<GetApiEnvsResultError, z.infer<typeof zGetApiEnvsResultError>>(
  { value: true }
);
