import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendCommitRepoError,
  zToBackendCommitRepoError
} from './commit-repo-error';

export type ToBackendCommitRepoOutput = {
  repo: Repo;
  session?: SessionApi;
};

export type ToBackendCommitRepoResponse = ToBackendResponse<
  ToBackendCommitRepoOutput,
  ToBackendCommitRepoError
>;

export let zToBackendCommitRepoOutput = z
  .object({
    repo: zRepo,
    session: zSessionApi.nullish()
  })
  .meta({ id: 'ToBackendCommitRepoOutput' });

export let zToBackendCommitRepoResponse = makeToBackendResponseSchema({
  success: zToBackendCommitRepoOutput,
  error: zToBackendCommitRepoError
}).meta({ id: 'ToBackendCommitRepoResponse' });

assertTypesEqual<
  ToBackendCommitRepoOutput,
  z.infer<typeof zToBackendCommitRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCommitRepoResponse,
  z.infer<typeof zToBackendCommitRepoResponse>
>({ value: true });
