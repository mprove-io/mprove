import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCommitRepoError,
  zToDiskCommitRepoError
} from './commit-repo-error';

export type ToDiskCommitRepoResponse = ToDiskResponseBase<
  'commitRepo',
  ToDiskCommitRepoOutput,
  ToDiskCommitRepoError
>;

export type ToDiskCommitRepoOutput = { repo: Repo };

export let zToDiskCommitRepoOutput = z
  .object({ repo: zRepo })
  .meta({ id: 'ToDiskCommitRepoOutput' });

export let zToDiskCommitRepoResponse = makeToDiskResponseSchema({
  operation: 'commitRepo',
  output: zToDiskCommitRepoOutput,
  error: zToDiskCommitRepoError
});

assertTypesEqual<
  ToDiskCommitRepoOutput,
  z.infer<typeof zToDiskCommitRepoOutput>
>({ value: true });

assertTypesEqual<
  ToDiskCommitRepoResponse,
  z.infer<typeof zToDiskCommitRepoResponse>
>({ value: true });
