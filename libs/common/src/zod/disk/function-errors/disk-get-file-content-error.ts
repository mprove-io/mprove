import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReadFileCheckSizeError,
  zReadFileCheckSizeError
} from '#common/zod/node-common/function-errors/read-file-check-size-error';

export type DiskGetFileContentError = ReadFileCheckSizeError;

export let zDiskGetFileContentError = zReadFileCheckSizeError;

assertTypesEqual<
  DiskGetFileContentError,
  z.infer<typeof zDiskGetFileContentError>
>({ value: true });
