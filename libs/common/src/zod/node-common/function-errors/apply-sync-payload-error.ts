import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { FileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import { zFileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import {
  type ValidatePathUnderDirError,
  zValidatePathUnderDirError
} from '#common/zod/node-common/function-errors/validate-path-under-dir-error';

export type ApplySyncPayloadError =
  | ValidatePathUnderDirError
  | FileIsSymlinkError;

export let zApplySyncPayloadError = z.union([
  zValidatePathUnderDirError,
  zFileIsSymlinkError
]);

assertTypesEqual<ApplySyncPayloadError, z.infer<typeof zApplySyncPayloadError>>(
  { value: true }
);
