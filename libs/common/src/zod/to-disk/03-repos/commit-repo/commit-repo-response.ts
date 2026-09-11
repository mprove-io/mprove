import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskCommitRepoError,
  zToDiskCommitRepoError
} from './commit-repo-error';

export type ToDiskCommitRepoOutput = { repo: Repo };

export type ToDiskCommitRepoResponse = ToDiskResponse<
  'ToDiskCommitRepo',
  ToDiskCommitRepoOutput,
  ToDiskCommitRepoError
>;

export let zToDiskCommitRepoResponse = makeToDiskResponseSchema({
  path: 'ToDiskCommitRepo',
  success: z.object({ repo: zRepo }).meta({ id: 'ToDiskCommitRepoOutput' }),
  error: zToDiskCommitRepoError
});

assertTypesEqual<
  ToDiskCommitRepoResponse,
  z.infer<typeof zToDiskCommitRepoResponse>
>({ value: true });
