import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCommitRepoOutput,
  zToBackendCommitRepoOutput
} from '#common/types/backend/routes/repos/commit-repo/commit-repo-output';
import {
  type ToBackendCommitRepoError,
  zToBackendCommitRepoError
} from './commit-repo-error';

export type ToBackendCommitRepoResponse = ToBackendResponseBase<
  'commitRepo',
  ToBackendCommitRepoOutput,
  ToBackendCommitRepoError
>;

export let zToBackendCommitRepoResponse = makeToBackendResponseSchema({
  operation: 'commitRepo',
  output: zToBackendCommitRepoOutput,
  error: zToBackendCommitRepoError
}).meta({ id: 'ToBackendCommitRepoResponse' });

assertTypesEqual<
  ToBackendCommitRepoResponse,
  z.infer<typeof zToBackendCommitRepoResponse>
>({ value: true });
