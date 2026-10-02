import { z } from 'zod';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';
import { type User, zUser } from '#common/types/backend/parts/user';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToBackendGetNavOutput = {
  avatarSmall: string;
  avatarBig: string;
  orgId: string;
  orgOwnerId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  projectDefaultBranch: string;
  repoId: string;
  repoType: RepoTypeEnum.Production | RepoTypeEnum.Dev | RepoTypeEnum.Session;
  branchId: string;
  envId: string;
  needValidate: boolean;
  user: User;
  serverNowTs: number;
  isMproveAdmin: boolean;
  struct: StructX;
  userMember: Member;
  repo: Repo;
};

export let zToBackendGetNavOutput = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string(),
    orgId: z.string(),
    orgOwnerId: z.string(),
    orgName: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    projectDefaultBranch: z.string(),
    repoId: z.string(),
    repoType: z.enum(RepoTypeEnum),
    branchId: z.string(),
    envId: z.string(),
    needValidate: z.boolean(),
    user: zUser,
    serverNowTs: z.number(),
    isMproveAdmin: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    repo: zRepo
  })
  .meta({ id: 'ToBackendGetNavOutput' });

assertTypesEqual<ToBackendGetNavOutput, z.infer<typeof zToBackendGetNavOutput>>(
  { value: true }
);
