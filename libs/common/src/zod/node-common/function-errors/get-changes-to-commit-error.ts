import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ReadFileCheckSizeError,
  zReadFileCheckSizeError
} from '#common/zod/node-common/function-errors/read-file-check-size-error';

export type GetChangesToCommitError = ReadFileCheckSizeError;

export let zGetChangesToCommitError = zReadFileCheckSizeError;

assertTypesEqual<
  GetChangesToCommitError,
  z.infer<typeof zGetChangesToCommitError>
>({ value: true });
