import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';

export type RebuildBranchBridgeError = RebuildStructError;

export const zRebuildBranchBridgeError = zRebuildStructError;

assertTypesEqual<
  RebuildBranchBridgeError,
  z.infer<typeof zRebuildBranchBridgeError>
>({ value: true });
