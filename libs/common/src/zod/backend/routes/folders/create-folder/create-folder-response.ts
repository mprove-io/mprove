import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendCreateFolderError,
  zToBackendCreateFolderError
} from './create-folder-error';

export type ToBackendCreateFolderOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendCreateFolderResponse = ToBackendResponse<
  ToBackendCreateFolderOutput,
  ToBackendCreateFolderError
>;

export let zToBackendCreateFolderOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendCreateFolderOutput' });

export let zToBackendCreateFolderResponse = makeToBackendResponseSchema({
  success: zToBackendCreateFolderOutput,
  error: zToBackendCreateFolderError
}).meta({ id: 'ToBackendCreateFolderResponse' });

assertTypesEqual<
  ToBackendCreateFolderOutput,
  z.infer<typeof zToBackendCreateFolderOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateFolderResponse,
  z.infer<typeof zToBackendCreateFolderResponse>
>({ value: true });
