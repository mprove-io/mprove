import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendRevertRepoToLastCommitOutput,
  zToBackendRevertRepoToLastCommitOutput
} from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-output';
import {
  type ToBackendRevertRepoToLastCommitError,
  zToBackendRevertRepoToLastCommitError
} from './revert-repo-to-last-commit-error';

export type ToBackendRevertRepoToLastCommitResponse = ToBackendResponseBase<
  'revertRepoToLastCommit',
  ToBackendRevertRepoToLastCommitOutput,
  ToBackendRevertRepoToLastCommitError
>;

export let zToBackendRevertRepoToLastCommitResponse =
  makeToBackendResponseSchema({
    operation: 'revertRepoToLastCommit',
    output: zToBackendRevertRepoToLastCommitOutput,
    error: zToBackendRevertRepoToLastCommitError
  }).meta({ id: 'ToBackendRevertRepoToLastCommitResponse' });

assertTypesEqual<
  ToBackendRevertRepoToLastCommitResponse,
  z.infer<typeof zToBackendRevertRepoToLastCommitResponse>
>({ value: true });
