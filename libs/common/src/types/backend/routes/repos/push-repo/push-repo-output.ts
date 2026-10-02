import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToBackendPushRepoOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export let zToBackendPushRepoOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendPushRepoOutput' });

assertTypesEqual<
  ToBackendPushRepoOutput,
  z.infer<typeof zToBackendPushRepoOutput>
>({ value: true });
