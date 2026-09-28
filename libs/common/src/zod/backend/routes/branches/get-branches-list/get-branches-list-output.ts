import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendGetBranchesListOutputBranchesItem,
  zToBackendGetBranchesListOutputBranchesItem
} from '#common/zod/backend/branches/to-backend-get-branches-list-output-branches-item';
import { type Member, zMember } from '#common/zod/backend/member';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';

export type ToBackendGetBranchesListOutput = {
  branchesList: ToBackendGetBranchesListOutputBranchesItem[];
  sessionsList: SessionApi[];
  userMember: Member;
};

export let zToBackendGetBranchesListOutput = z
  .object({
    branchesList: z.array(zToBackendGetBranchesListOutputBranchesItem),
    sessionsList: z.array(zSessionApi),
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetBranchesListOutput' });

assertTypesEqual<
  ToBackendGetBranchesListOutput,
  z.infer<typeof zToBackendGetBranchesListOutput>
>({ value: true });
