import { z } from 'zod';
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
  type ToBackendGetRepoError,
  zToBackendGetRepoError
} from './get-repo-error';

export type ToBackendGetRepoOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  user: User;
  repo: Repo;
};

export type ToBackendGetRepoResponse = ToBackendResponse<
  ToBackendGetRepoOutput,
  ToBackendGetRepoError
>;

export let zToBackendGetRepoOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    user: zUser,
    repo: zRepo
  })
  .meta({ id: 'ToBackendGetRepoOutput' });

export let zToBackendGetRepoResponse = makeToBackendResponseSchema({
  success: zToBackendGetRepoOutput,
  error: zToBackendGetRepoError
}).meta({ id: 'ToBackendGetRepoResponse' });

assertTypesEqual<
  ToBackendGetRepoOutput,
  z.infer<typeof zToBackendGetRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetRepoResponse,
  z.infer<typeof zToBackendGetRepoResponse>
>({ value: true });
