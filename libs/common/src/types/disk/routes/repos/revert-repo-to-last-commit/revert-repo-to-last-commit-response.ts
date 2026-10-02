import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskRevertRepoToLastCommitError,
  zToDiskRevertRepoToLastCommitError
} from './revert-repo-to-last-commit-error';
import {
  type ToDiskRevertRepoToLastCommitOutput,
  zToDiskRevertRepoToLastCommitOutput
} from './revert-repo-to-last-commit-output';

export type ToDiskRevertRepoToLastCommitResponse = ToDiskResponseBase<
  'revertRepoToLastCommit',
  ToDiskRevertRepoToLastCommitOutput,
  ToDiskRevertRepoToLastCommitError
>;

export let zToDiskRevertRepoToLastCommitResponse = makeToDiskResponseSchema({
  operation: 'revertRepoToLastCommit',
  output: zToDiskRevertRepoToLastCommitOutput,
  error: zToDiskRevertRepoToLastCommitError
});

assertTypesEqual<
  ToDiskRevertRepoToLastCommitResponse,
  z.infer<typeof zToDiskRevertRepoToLastCommitResponse>
>({ value: true });
