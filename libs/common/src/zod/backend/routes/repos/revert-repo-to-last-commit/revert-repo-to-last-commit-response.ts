import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendRevertRepoToLastCommitError,
  zToBackendRevertRepoToLastCommitError
} from './revert-repo-to-last-commit-error';

export type ToBackendRevertRepoToLastCommitOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendRevertRepoToLastCommitResponse = ToBackendResponse<
  ToBackendRevertRepoToLastCommitOutput,
  ToBackendRevertRepoToLastCommitError
>;

export let zToBackendRevertRepoToLastCommitOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRevertRepoToLastCommitOutput' });

export let zToBackendRevertRepoToLastCommitResponse =
  makeToBackendResponseSchema({
    success: zToBackendRevertRepoToLastCommitOutput,
    error: zToBackendRevertRepoToLastCommitError
  }).meta({ id: 'ToBackendRevertRepoToLastCommitResponse' });

assertTypesEqual<
  ToBackendRevertRepoToLastCommitOutput,
  z.infer<typeof zToBackendRevertRepoToLastCommitOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRevertRepoToLastCommitResponse,
  z.infer<typeof zToBackendRevertRepoToLastCommitResponse>
>({ value: true });
