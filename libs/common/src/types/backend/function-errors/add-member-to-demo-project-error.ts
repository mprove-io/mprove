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
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';
import {
  type ProjectEntToTabError,
  zProjectEntToTabError
} from '#common/types/backend/function-errors/project-ent-to-tab-error';
import {
  type RebuildBranchBridgesError,
  zRebuildBranchBridgesError
} from '#common/types/backend/function-errors/rebuild-branch-bridges-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type AddMemberToDemoProjectError =
  | BranchEntToTabError
  | BridgeEntToTabError
  | ProjectEntToTabError
  | MemberEntToTabError
  | SendToDiskError
  | RebuildBranchBridgesError
  | WriteError;

export const zAddMemberToDemoProjectError = z.union([
  zBranchEntToTabError,
  zBridgeEntToTabError,
  zProjectEntToTabError,
  zMemberEntToTabError,
  zSendToDiskError,
  zRebuildBranchBridgesError,
  zWriteError
]);

assertTypesEqual<
  AddMemberToDemoProjectError,
  z.infer<typeof zAddMemberToDemoProjectError>
>({ value: true });
