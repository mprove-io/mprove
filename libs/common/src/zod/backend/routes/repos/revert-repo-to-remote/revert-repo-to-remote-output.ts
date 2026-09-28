import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToBackendRevertRepoToRemoteOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export let zToBackendRevertRepoToRemoteOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRevertRepoToRemoteOutput' });

assertTypesEqual<
  ToBackendRevertRepoToRemoteOutput,
  z.infer<typeof zToBackendRevertRepoToRemoteOutput>
>({ value: true });
