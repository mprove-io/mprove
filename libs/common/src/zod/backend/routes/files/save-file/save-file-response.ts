import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendSaveFileError,
  zToBackendSaveFileError
} from './save-file-error';

export type ToBackendSaveFileOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendSaveFileResponse = ToBackendResponse<
  ToBackendSaveFileOutput,
  ToBackendSaveFileError
>;

export let zToBackendSaveFileOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendSaveFileOutput' });

export let zToBackendSaveFileResponse = makeToBackendResponseSchema({
  success: zToBackendSaveFileOutput,
  error: zToBackendSaveFileError
}).meta({ id: 'ToBackendSaveFileResponse' });

assertTypesEqual<
  ToBackendSaveFileOutput,
  z.infer<typeof zToBackendSaveFileOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveFileResponse,
  z.infer<typeof zToBackendSaveFileResponse>
>({ value: true });
