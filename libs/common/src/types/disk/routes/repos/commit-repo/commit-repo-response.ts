import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskCommitRepoError,
  zToDiskCommitRepoError
} from './commit-repo-error';
import {
  type ToDiskCommitRepoOutput,
  zToDiskCommitRepoOutput
} from './commit-repo-output';

export type ToDiskCommitRepoResponse = ToDiskResponseBase<
  'commitRepo',
  ToDiskCommitRepoOutput,
  ToDiskCommitRepoError
>;

export let zToDiskCommitRepoResponse = makeToDiskResponseSchema({
  operation: 'commitRepo',
  output: zToDiskCommitRepoOutput,
  error: zToDiskCommitRepoError
});

assertTypesEqual<
  ToDiskCommitRepoResponse,
  z.infer<typeof zToDiskCommitRepoResponse>
>({ value: true });
