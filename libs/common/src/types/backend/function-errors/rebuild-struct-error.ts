import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';
import {
  type SendToBlockmlError,
  zSendToBlockmlError
} from '#common/types/backend/function-errors/send-to-blockml-error';

export type RebuildStructError =
  | GetApiEnvsError
  | ConnectionEntToTabError
  | SendToBlockmlError
  | DbErrorToError;

export let zRebuildStructError = z.union([
  zGetApiEnvsError,
  zConnectionEntToTabError,
  zSendToBlockmlError,
  zDbErrorToError
]);

assertTypesEqual<RebuildStructError, z.infer<typeof zRebuildStructError>>({
  value: true
});
