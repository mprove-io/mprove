import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendDeleteFolderError,
  zToBackendDeleteFolderError
} from './delete-folder-error';

export type ToBackendDeleteFolderOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendDeleteFolderResponse = ToBackendResponse<
  ToBackendDeleteFolderOutput,
  ToBackendDeleteFolderError
>;

export let zToBackendDeleteFolderOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendDeleteFolderOutput' });

export let zToBackendDeleteFolderResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteFolderOutput,
  error: zToBackendDeleteFolderError
}).meta({ id: 'ToBackendDeleteFolderResponse' });

assertTypesEqual<
  ToBackendDeleteFolderOutput,
  z.infer<typeof zToBackendDeleteFolderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteFolderResponse,
  z.infer<typeof zToBackendDeleteFolderResponse>
>({ value: true });
