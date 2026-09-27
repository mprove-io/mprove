import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendValidateFilesError,
  zToBackendValidateFilesError
} from './validate-files-error';

export type ToBackendValidateFilesOutput = {
  repo: Repo;
  needValidate: boolean;
  struct: StructX;
};

export type ToBackendValidateFilesResponse = ToBackendResponse<
  ToBackendValidateFilesOutput,
  ToBackendValidateFilesError
>;

export let zToBackendValidateFilesOutput = z
  .object({
    repo: zRepo,
    needValidate: z.boolean(),
    struct: zStructX
  })
  .meta({ id: 'ToBackendValidateFilesOutput' });

export let zToBackendValidateFilesResponse = makeToBackendResponseSchema({
  success: zToBackendValidateFilesOutput,
  error: zToBackendValidateFilesError
}).meta({ id: 'ToBackendValidateFilesResponse' });

assertTypesEqual<
  ToBackendValidateFilesOutput,
  z.infer<typeof zToBackendValidateFilesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendValidateFilesResponse,
  z.infer<typeof zToBackendValidateFilesResponse>
>({ value: true });
