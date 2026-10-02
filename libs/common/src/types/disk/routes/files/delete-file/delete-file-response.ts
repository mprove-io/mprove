import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteFileError,
  zToDiskDeleteFileError
} from './delete-file-error';
import {
  type ToDiskDeleteFileOutput,
  zToDiskDeleteFileOutput
} from './delete-file-output';

export type ToDiskDeleteFileResponse = ToDiskResponseBase<
  'deleteFile',
  ToDiskDeleteFileOutput,
  ToDiskDeleteFileError
>;

export let zToDiskDeleteFileResponse = makeToDiskResponseSchema({
  operation: 'deleteFile',
  output: zToDiskDeleteFileOutput,
  error: zToDiskDeleteFileError
});

assertTypesEqual<
  ToDiskDeleteFileResponse,
  z.infer<typeof zToDiskDeleteFileResponse>
>({ value: true });
