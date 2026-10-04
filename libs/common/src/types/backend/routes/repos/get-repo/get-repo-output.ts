import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';
import { type User, zUser } from '#common/types/backend/parts/user';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';

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
