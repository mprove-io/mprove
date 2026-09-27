import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendCreateFileError,
  zToBackendCreateFileError
} from './create-file-error';

export type ToBackendCreateFileOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendCreateFileResponse = ToBackendResponse<
  ToBackendCreateFileOutput,
  ToBackendCreateFileError
>;

export let zToBackendCreateFileOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendCreateFileOutput' });

export let zToBackendCreateFileResponse = makeToBackendResponseSchema({
  success: zToBackendCreateFileOutput,
  error: zToBackendCreateFileError
}).meta({ id: 'ToBackendCreateFileResponse' });

assertTypesEqual<
  ToBackendCreateFileOutput,
  z.infer<typeof zToBackendCreateFileOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateFileResponse,
  z.infer<typeof zToBackendCreateFileResponse>
>({ value: true });
