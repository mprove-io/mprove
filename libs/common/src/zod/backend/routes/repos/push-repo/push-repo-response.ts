import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendPushRepoError,
  zToBackendPushRepoError
} from './push-repo-error';

export type ToBackendPushRepoOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendPushRepoResponse = ToBackendResponse<
  ToBackendPushRepoOutput,
  ToBackendPushRepoError
>;

export let zToBackendPushRepoOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendPushRepoOutput' });

export let zToBackendPushRepoResponse = makeToBackendResponseSchema({
  success: zToBackendPushRepoOutput,
  error: zToBackendPushRepoError
}).meta({ id: 'ToBackendPushRepoResponse' });

assertTypesEqual<
  ToBackendPushRepoOutput,
  z.infer<typeof zToBackendPushRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendPushRepoResponse,
  z.infer<typeof zToBackendPushRepoResponse>
>({ value: true });
