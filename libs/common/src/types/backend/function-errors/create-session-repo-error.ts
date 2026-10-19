import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BranchEntToTabError,
  zBranchEntToTabError
} from '#common/types/backend/function-errors/branch-ent-to-tab-error';
import {
  type BridgeEntToTabError,
  zBridgeEntToTabError
} from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
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
  | BranchEntToTabError
  | BridgeEntToTabError
  | SendToDiskError
  | RebuildStructError
  | WriteError;

export let zCreateSessionRepoError = z.union([
  zBranchEntToTabError,
  zBridgeEntToTabError,
  zSendToDiskError,
  zRebuildStructError,
  zWriteError
]);

assertTypesEqual<
  CreateSessionRepoError,
  z.infer<typeof zCreateSessionRepoError>
>({ value: true });
