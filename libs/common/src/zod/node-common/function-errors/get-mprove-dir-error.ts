import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ReadFileCheckSizeError,
  zReadFileCheckSizeError
} from '#common/zod/node-common/function-errors/read-file-check-size-error';

export type GetMproveDirError = ReadFileCheckSizeError;

export let zGetMproveDirError = zReadFileCheckSizeError;

assertTypesEqual<GetMproveDirError, z.infer<typeof zGetMproveDirError>>({
  value: true
});
