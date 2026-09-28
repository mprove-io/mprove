import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetMembersListOutput,
  zToBackendGetMembersListOutput
} from '#common/zod/backend/routes/members/get-members-list/get-members-list-output';
import {
  type ToBackendGetMembersListError,
  zToBackendGetMembersListError
} from './get-members-list-error';

export type ToBackendGetMembersListResponse = ToBackendResponseBase<
  'getMembersList',
  ToBackendGetMembersListOutput,
  ToBackendGetMembersListError
>;

export let zToBackendGetMembersListResponse = makeToBackendResponseSchema({
  operation: 'getMembersList',
  output: zToBackendGetMembersListOutput,
  error: zToBackendGetMembersListError
}).meta({ id: 'ToBackendGetMembersListResponse' });

assertTypesEqual<
  ToBackendGetMembersListResponse,
  z.infer<typeof zToBackendGetMembersListResponse>
>({ value: true });
