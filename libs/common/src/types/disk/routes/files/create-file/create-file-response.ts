import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskCreateFileError,
  zToDiskCreateFileError
} from './create-file-error';
import {
  type ToDiskCreateFileOutput,
  zToDiskCreateFileOutput
} from './create-file-output';

export type ToDiskCreateFileResponse = ToDiskResponseBase<
  'createFile',
  ToDiskCreateFileOutput,
  ToDiskCreateFileError
>;

export let zToDiskCreateFileResponse = makeToDiskResponseSchema({
  operation: 'createFile',
  output: zToDiskCreateFileOutput,
  error: zToDiskCreateFileError
});

assertTypesEqual<
  ToDiskCreateFileResponse,
  z.infer<typeof zToDiskCreateFileResponse>
>({ value: true });
