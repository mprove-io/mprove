import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendGetBranchesListOutputBranchesItem,
  zToBackendGetBranchesListOutputBranchesItem
} from '#common/types/backend/branches/to-backend-get-branches-list-output-branches-item';
import { type Member, zMember } from '#common/types/backend/member';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/session-api';

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
