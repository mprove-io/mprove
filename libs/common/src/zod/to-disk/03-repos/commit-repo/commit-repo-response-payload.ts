import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskCommitRepoResponsePayload = {
  repo: Repo;
};

export let zToDiskCommitRepoResponsePayload = z
  .object({
    repo: zRepo
  })
  .meta({ id: 'ToDiskCommitRepoResponsePayload' });

assertTypesEqual<
  ToDiskCommitRepoResponsePayload,
  z.infer<typeof zToDiskCommitRepoResponsePayload>
>({ value: true });
