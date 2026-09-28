import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type User, zUser } from '#common/zod/backend/user';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToBackendGetRepoOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  user: User;
  repo: Repo;
};

export let zToBackendGetRepoOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    user: zUser,
    repo: zRepo
  })
  .meta({ id: 'ToBackendGetRepoOutput' });

assertTypesEqual<
  ToBackendGetRepoOutput,
  z.infer<typeof zToBackendGetRepoOutput>
>({ value: true });
