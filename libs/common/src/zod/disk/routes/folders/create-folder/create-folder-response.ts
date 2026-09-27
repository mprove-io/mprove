import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCreateFolderError,
  zToDiskCreateFolderError
} from './create-folder-error';
import {
  type ToDiskCreateFolderOutput,
  zToDiskCreateFolderOutput
} from './create-folder-output';

export type ToDiskCreateFolderResponse = ToDiskResponseBase<
  'createFolder',
  ToDiskCreateFolderOutput,
  ToDiskCreateFolderError
>;

export let zToDiskCreateFolderResponse = makeToDiskResponseSchema({
  operation: 'createFolder',
  output: zToDiskCreateFolderOutput,
  error: zToDiskCreateFolderError
});

assertTypesEqual<
  ToDiskCreateFolderResponse,
  z.infer<typeof zToDiskCreateFolderResponse>
>({ value: true });
