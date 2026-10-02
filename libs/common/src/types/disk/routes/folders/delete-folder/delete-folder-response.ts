import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteFolderError,
  zToDiskDeleteFolderError
} from './delete-folder-error';
import {
  type ToDiskDeleteFolderOutput,
  zToDiskDeleteFolderOutput
} from './delete-folder-output';

export type ToDiskDeleteFolderResponse = ToDiskResponseBase<
  'deleteFolder',
  ToDiskDeleteFolderOutput,
  ToDiskDeleteFolderError
>;

export let zToDiskDeleteFolderResponse = makeToDiskResponseSchema({
  operation: 'deleteFolder',
  output: zToDiskDeleteFolderOutput,
  error: zToDiskDeleteFolderError
});

assertTypesEqual<
  ToDiskDeleteFolderResponse,
  z.infer<typeof zToDiskDeleteFolderResponse>
>({ value: true });
