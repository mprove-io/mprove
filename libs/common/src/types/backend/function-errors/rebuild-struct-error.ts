import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbConnectionsFindManyError,
  zDbConnectionsFindManyError
} from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db/db-error-to-error';
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
  | SendToBlockmlError
  | DbErrorToError
  | DbConnectionsFindManyError;

export let zRebuildStructError = z.union([
  zGetApiEnvsError,
  zSendToBlockmlError,
  zDbErrorToError,
  zDbConnectionsFindManyError
]);

assertTypesEqual<RebuildStructError, z.infer<typeof zRebuildStructError>>({
  value: true
});
