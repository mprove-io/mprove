import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type RemovePathUnderDirError,
  zRemovePathUnderDirError
} from '#common/zod/node-common/function-errors/remove-path-under-dir-error';

export type ResetWorkingTreeToHeadError = RemovePathUnderDirError;

export let zResetWorkingTreeToHeadError = zRemovePathUnderDirError;

assertTypesEqual<
  ResetWorkingTreeToHeadError,
  z.infer<typeof zResetWorkingTreeToHeadError>
>({ value: true });
