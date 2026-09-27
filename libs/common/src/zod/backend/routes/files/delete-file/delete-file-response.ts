import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendDeleteFileError,
  zToBackendDeleteFileError
} from './delete-file-error';

export type ToBackendDeleteFileOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendDeleteFileResponse = ToBackendResponse<
  ToBackendDeleteFileOutput,
  ToBackendDeleteFileError
>;

export let zToBackendDeleteFileOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendDeleteFileOutput' });

export let zToBackendDeleteFileResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteFileOutput,
  error: zToBackendDeleteFileError
}).meta({ id: 'ToBackendDeleteFileResponse' });

assertTypesEqual<
  ToBackendDeleteFileOutput,
  z.infer<typeof zToBackendDeleteFileOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteFileResponse,
  z.infer<typeof zToBackendDeleteFileResponse>
>({ value: true });
