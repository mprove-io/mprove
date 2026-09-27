import { z } from 'zod';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type User, zUser } from '#common/zod/backend/user';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendGetNavError,
  zToBackendGetNavError
} from './get-nav-error';

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

export type ToBackendGetNavResponse = ToBackendResponse<
  ToBackendGetNavOutput,
  ToBackendGetNavError
>;

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

export let zToBackendGetNavResponse = makeToBackendResponseSchema({
  success: zToBackendGetNavOutput,
  error: zToBackendGetNavError
}).meta({ id: 'ToBackendGetNavResponse' });

assertTypesEqual<ToBackendGetNavOutput, z.infer<typeof zToBackendGetNavOutput>>(
  { value: true }
);

assertTypesEqual<
  ToBackendGetNavResponse,
  z.infer<typeof zToBackendGetNavResponse>
>({ value: true });
