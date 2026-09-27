import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendPullRepoError,
  zToBackendPullRepoError
} from './pull-repo-error';

export type ToBackendPullRepoOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendPullRepoResponse = ToBackendResponse<
  ToBackendPullRepoOutput,
  ToBackendPullRepoError
>;

export let zToBackendPullRepoOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendPullRepoOutput' });

export let zToBackendPullRepoResponse = makeToBackendResponseSchema({
  success: zToBackendPullRepoOutput,
  error: zToBackendPullRepoError
}).meta({ id: 'ToBackendPullRepoResponse' });

assertTypesEqual<
  ToBackendPullRepoOutput,
  z.infer<typeof zToBackendPullRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendPullRepoResponse,
  z.infer<typeof zToBackendPullRepoResponse>
>({ value: true });
