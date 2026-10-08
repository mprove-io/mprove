import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToResultError,
  zDbErrorToResultError
} from '#common/types/backend/function-errors/db-error-to-result-error';
import {
  type RebuildStructResultError,
  zRebuildStructResultError
} from '#common/types/backend/function-errors/rebuild-struct-result-error';
import {
  type SendToDiskResultError,
  zSendToDiskResultError
} from '#common/types/backend/function-errors/send-to-disk-result-error';

export type AddProjectResultError =
  | SendToDiskResultError
  | RebuildStructResultError
  | DbErrorToResultError;

export let zAddProjectResultError = z.union([
  zSendToDiskResultError,
  zRebuildStructResultError,
  zDbErrorToResultError
]);

assertTypesEqual<AddProjectResultError, z.infer<typeof zAddProjectResultError>>(
  { value: true }
);
