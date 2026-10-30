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
  type DbMembersFindFirstError,
  zDbMembersFindFirstError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-error';
import {
  type DbProjectsFindFirstError,
  zDbProjectsFindFirstError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-error';
import {
  type RebuildBlockmlBranchBridgesError,
  zRebuildBlockmlBranchBridgesError
} from '#common/types/backend/function-errors/rebuild-blockml-branch-bridges-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type AddMemberToDemoProjectError =
  | SendToDiskError
  | RebuildBlockmlBranchBridgesError
  | WriteError
  | DbProjectsFindFirstError
  | DbMembersFindFirstError
  | DbBranchesFindFirstError
  | DbBridgesFindManyError;

export const zAddMemberToDemoProjectError = z.union([
  zSendToDiskError,
  zRebuildBlockmlBranchBridgesError,
  zWriteError,
  zDbProjectsFindFirstError,
  zDbMembersFindFirstError,
  zDbBranchesFindFirstError,
  zDbBridgesFindManyError
]);

assertTypesEqual<
  AddMemberToDemoProjectError,
  z.infer<typeof zAddMemberToDemoProjectError>
>({ value: true });
