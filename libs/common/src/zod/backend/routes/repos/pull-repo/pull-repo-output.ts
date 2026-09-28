import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToBackendPullRepoOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export let zToBackendPullRepoOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendPullRepoOutput' });

assertTypesEqual<
  ToBackendPullRepoOutput,
  z.infer<typeof zToBackendPullRepoOutput>
>({ value: true });
