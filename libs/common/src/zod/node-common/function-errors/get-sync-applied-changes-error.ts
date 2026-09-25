import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReadFileCheckSizeError,
  zReadFileCheckSizeError
} from '#common/zod/node-common/function-errors/read-file-check-size-error';
import {
  type ValidatePathUnderDirError,
  zValidatePathUnderDirError
} from '#common/zod/node-common/function-errors/validate-path-under-dir-error';

export type GetSyncAppliedChangesError =
  | ValidatePathUnderDirError
  | ReadFileCheckSizeError;

export let zGetSyncAppliedChangesError = z.union([
  zValidatePathUnderDirError,
  zReadFileCheckSizeError
]);

assertTypesEqual<
  GetSyncAppliedChangesError,
  z.infer<typeof zGetSyncAppliedChangesError>
>({ value: true });
