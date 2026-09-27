import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import { type ToDiskGetFileError, zToDiskGetFileError } from './get-file-error';
import {
  type ToDiskGetFileOutput,
  zToDiskGetFileOutput
} from './get-file-output';

export type ToDiskGetFileResponse = ToDiskResponseBase<
  'getFile',
  ToDiskGetFileOutput,
  ToDiskGetFileError
>;

export let zToDiskGetFileResponse = makeToDiskResponseSchema({
  operation: 'getFile',
  output: zToDiskGetFileOutput,
  error: zToDiskGetFileError
});

assertTypesEqual<ToDiskGetFileResponse, z.infer<typeof zToDiskGetFileResponse>>(
  { value: true }
);
