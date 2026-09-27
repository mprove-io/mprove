import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendMergeRepoError,
  zToBackendMergeRepoError
} from './merge-repo-error';

export type ToBackendMergeRepoOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendMergeRepoResponse = ToBackendResponse<
  ToBackendMergeRepoOutput,
  ToBackendMergeRepoError
>;

export let zToBackendMergeRepoOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendMergeRepoOutput' });

export let zToBackendMergeRepoResponse = makeToBackendResponseSchema({
  success: zToBackendMergeRepoOutput,
  error: zToBackendMergeRepoError
}).meta({ id: 'ToBackendMergeRepoResponse' });

assertTypesEqual<
  ToBackendMergeRepoOutput,
  z.infer<typeof zToBackendMergeRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendMergeRepoResponse,
  z.infer<typeof zToBackendMergeRepoResponse>
>({ value: true });
