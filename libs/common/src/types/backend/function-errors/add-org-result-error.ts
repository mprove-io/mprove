import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToResultError,
  zDbErrorToResultError
} from '#common/types/backend/function-errors/db-error-to-result-error';
import {
  type SendToDiskResultError,
  zSendToDiskResultError
} from '#common/types/backend/function-errors/send-to-disk-result-error';

export type AddOrgResultError = SendToDiskResultError | DbErrorToResultError;

export let zAddOrgResultError = z.union([
  zSendToDiskResultError,
  zDbErrorToResultError
]);

assertTypesEqual<AddOrgResultError, z.infer<typeof zAddOrgResultError>>({
  value: true
});
