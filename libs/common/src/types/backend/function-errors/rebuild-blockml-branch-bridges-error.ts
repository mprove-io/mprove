import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RebuildBlockmlBranchBridgeError,
  zRebuildBlockmlBranchBridgeError
} from '#common/types/backend/function-errors/rebuild-blockml-branch-bridge-error';

export type RebuildBlockmlBranchBridgesError = RebuildBlockmlBranchBridgeError;

export const zRebuildBlockmlBranchBridgesError =
  zRebuildBlockmlBranchBridgeError;

assertTypesEqual<
  RebuildBlockmlBranchBridgesError,
  z.infer<typeof zRebuildBlockmlBranchBridgesError>
>({ value: true });
