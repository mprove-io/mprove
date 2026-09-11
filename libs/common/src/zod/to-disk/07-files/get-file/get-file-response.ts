import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskPilotResponseSchema,
  type ToDiskPilotResponse,
  type ToDiskPilotSuccessResponse
} from '#common/zod/to-disk/to-disk-pilot-response';
import { type ToDiskGetFileError, zToDiskGetFileError } from './get-file-error';

export type ToDiskGetFileResponsePayload = {
  repo: Repo;
  originalContent: string;
  content: string;
  isExist: boolean;
};

export type ToDiskGetFileResponse = ToDiskPilotResponse<
  'ToDiskGetFile',
  ToDiskGetFileResponsePayload,
  ToDiskGetFileError
>;

export type ToDiskGetFileSuccessResponse =
  ToDiskPilotSuccessResponse<ToDiskGetFileResponse>;

export let zToDiskGetFileResponse = makeToDiskPilotResponseSchema({
  path: 'ToDiskGetFile',
  success: z
    .object({
      repo: zRepo,
      originalContent: z.string(),
      content: z.string(),
      isExist: z.boolean()
    })
    .meta({ id: 'ToDiskGetFileResponsePayload' }),
  error: zToDiskGetFileError
});

assertTypesEqual<ToDiskGetFileResponse, z.infer<typeof zToDiskGetFileResponse>>(
  { value: true }
);
