import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendGetFileError,
  zToBackendGetFileError
} from './get-file-error';

export type ToBackendGetFileOutput = {
  repo: Repo;
  originalContent: string;
  content: string;
  struct: StructX;
  needValidate: boolean;
  isExist: boolean;
};

export type ToBackendGetFileResponse = ToBackendResponse<
  ToBackendGetFileOutput,
  ToBackendGetFileError
>;

export let zToBackendGetFileOutput = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    struct: zStructX,
    needValidate: z.boolean(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendGetFileOutput' });

export let zToBackendGetFileResponse = makeToBackendResponseSchema({
  success: zToBackendGetFileOutput,
  error: zToBackendGetFileError
}).meta({ id: 'ToBackendGetFileResponse' });

assertTypesEqual<
  ToBackendGetFileOutput,
  z.infer<typeof zToBackendGetFileOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetFileResponse,
  z.infer<typeof zToBackendGetFileResponse>
>({ value: true });
