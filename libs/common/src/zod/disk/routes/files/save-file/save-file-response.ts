import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskSaveFileError,
  zToDiskSaveFileError
} from './save-file-error';
import {
  type ToDiskSaveFileOutput,
  zToDiskSaveFileOutput
} from './save-file-output';

export type ToDiskSaveFileResponse = ToDiskResponseBase<
  'saveFile',
  ToDiskSaveFileOutput,
  ToDiskSaveFileError
>;

export let zToDiskSaveFileResponse = makeToDiskResponseSchema({
  operation: 'saveFile',
  output: zToDiskSaveFileOutput,
  error: zToDiskSaveFileError
});

assertTypesEqual<
  ToDiskSaveFileResponse,
  z.infer<typeof zToDiskSaveFileResponse>
>({ value: true });
