import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendGetBranchesListOutputBranchesItem,
  zToBackendGetBranchesListOutputBranchesItem
} from '#common/zod/backend/branches/to-backend-get-branches-list-output-branches-item';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import {
  type ToBackendGetBranchesListError,
  zToBackendGetBranchesListError
} from './get-branches-list-error';

export type ToBackendGetBranchesListOutput = {
  branchesList: ToBackendGetBranchesListOutputBranchesItem[];
  sessionsList: SessionApi[];
  userMember: Member;
};

export type ToBackendGetBranchesListResponse = ToBackendResponse<
  ToBackendGetBranchesListOutput,
  ToBackendGetBranchesListError
>;

export let zToBackendGetBranchesListOutput = z
  .object({
    branchesList: z.array(zToBackendGetBranchesListOutputBranchesItem),
    sessionsList: z.array(zSessionApi),
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetBranchesListOutput' });

export let zToBackendGetBranchesListResponse = makeToBackendResponseSchema({
  success: zToBackendGetBranchesListOutput,
  error: zToBackendGetBranchesListError
}).meta({ id: 'ToBackendGetBranchesListResponse' });

assertTypesEqual<
  ToBackendGetBranchesListOutput,
  z.infer<typeof zToBackendGetBranchesListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetBranchesListResponse,
  z.infer<typeof zToBackendGetBranchesListResponse>
>({ value: true });
