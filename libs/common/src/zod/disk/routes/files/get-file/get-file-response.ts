import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import { type ToDiskGetFileError, zToDiskGetFileError } from './get-file-error';

export type ToDiskGetFileResponse = ToDiskResponseBase<
  'getFile',
  ToDiskGetFileOutput,
  ToDiskGetFileError
>;

export type ToDiskGetFileOutput = {
  repo: Repo;
  originalContent: string;
  content: string;
  isExist: boolean;
};

export let zToDiskGetFileOutput = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToDiskGetFileOutput' });

export let zToDiskGetFileResponse = makeToDiskResponseSchema({
  operation: 'getFile',
  output: zToDiskGetFileOutput,
  error: zToDiskGetFileError
});

assertTypesEqual<ToDiskGetFileOutput, z.infer<typeof zToDiskGetFileOutput>>({
  value: true
});

assertTypesEqual<ToDiskGetFileResponse, z.infer<typeof zToDiskGetFileResponse>>(
  { value: true }
);
