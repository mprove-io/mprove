import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';

export type CreateSessionRepoError =
  | SendToDiskError
  | RebuildStructError
  | DbErrorToError;

export let zCreateSessionRepoError = z.union([
  zSendToDiskError,
  zRebuildStructError,
  zDbErrorToError
]);

assertTypesEqual<
  CreateSessionRepoError,
  z.infer<typeof zCreateSessionRepoError>
>({ value: true });
