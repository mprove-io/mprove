import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabResultError,
  zConnectionEntToTabResultError
} from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import {
  type DbErrorToResultError,
  zDbErrorToResultError
} from '#common/types/backend/function-errors/db-error-to-result-error';
import {
  type GetApiEnvsResultError,
  zGetApiEnvsResultError
} from '#common/types/backend/function-errors/get-api-envs-result-error';
import {
  type SendToBlockmlResultError,
  zSendToBlockmlResultError
} from '#common/types/backend/function-errors/send-to-blockml-result-error';

export type RebuildStructResultError =
  | GetApiEnvsResultError
  | ConnectionEntToTabResultError
  | SendToBlockmlResultError
  | DbErrorToResultError;

export let zRebuildStructResultError = z.union([
  zGetApiEnvsResultError,
  zConnectionEntToTabResultError,
  zSendToBlockmlResultError,
  zDbErrorToResultError
]);

assertTypesEqual<
  RebuildStructResultError,
  z.infer<typeof zRebuildStructResultError>
>({ value: true });
