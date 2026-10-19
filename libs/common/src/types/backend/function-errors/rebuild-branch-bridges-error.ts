import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RebuildBranchBridgeError,
  zRebuildBranchBridgeError
} from '#common/types/backend/function-errors/rebuild-branch-bridge-error';

export type RebuildBranchBridgesError = RebuildBranchBridgeError;

export const zRebuildBranchBridgesError = zRebuildBranchBridgeError;

assertTypesEqual<
  RebuildBranchBridgesError,
  z.infer<typeof zRebuildBranchBridgesError>
>({ value: true });
