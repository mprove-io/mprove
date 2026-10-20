import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbBranchesFindFirstError,
  zDbBranchesFindFirstError
} from '#common/types/backend/function-errors/db/branches/db-branches-find-first-error';
import {
  type DbBridgesFindManyError,
  zDbBridgesFindManyError
} from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type CreateSessionRepoError =
  | SendToDiskError
  | RebuildStructError
  | WriteError
  | DbBranchesFindFirstError
  | DbBridgesFindManyError;

export let zCreateSessionRepoError = z.union([
  zSendToDiskError,
  zRebuildStructError,
  zWriteError,
  zDbBranchesFindFirstError,
  zDbBridgesFindManyError
]);

assertTypesEqual<
  CreateSessionRepoError,
  z.infer<typeof zCreateSessionRepoError>
>({ value: true });
