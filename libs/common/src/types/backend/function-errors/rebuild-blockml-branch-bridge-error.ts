import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RebuildBlockmlStructError,
  zRebuildBlockmlStructError
} from '#common/types/backend/function-errors/rebuild-blockml-struct-error';

export type RebuildBlockmlBranchBridgeError = RebuildBlockmlStructError;

export const zRebuildBlockmlBranchBridgeError = zRebuildBlockmlStructError;

assertTypesEqual<
  RebuildBlockmlBranchBridgeError,
  z.infer<typeof zRebuildBlockmlBranchBridgeError>
>({ value: true });
