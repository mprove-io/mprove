import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import { type ToDiskGetFileError, zToDiskGetFileError } from './get-file-error';

export type ToDiskGetFileOutput = {
  repo: Repo;
  originalContent: string;
  content: string;
  isExist: boolean;
};

export type ToDiskGetFileResponse = ToDiskResponse<
  'ToDiskGetFile',
  ToDiskGetFileOutput,
  ToDiskGetFileError
>;

export let zToDiskGetFileResponse = makeToDiskResponseSchema({
  path: 'ToDiskGetFile',
  success: z
    .object({
      repo: zRepo,
      originalContent: z.string(),
      content: z.string(),
      isExist: z.boolean()
    })
    .meta({ id: 'ToDiskGetFileOutput' }),
  error: zToDiskGetFileError
});

assertTypesEqual<ToDiskGetFileResponse, z.infer<typeof zToDiskGetFileResponse>>(
  { value: true }
);
