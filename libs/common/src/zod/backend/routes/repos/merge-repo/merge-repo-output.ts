import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToBackendMergeRepoOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export let zToBackendMergeRepoOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendMergeRepoOutput' });

assertTypesEqual<
  ToBackendMergeRepoOutput,
  z.infer<typeof zToBackendMergeRepoOutput>
>({ value: true });
