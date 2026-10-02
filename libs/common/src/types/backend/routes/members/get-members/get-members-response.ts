import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetMembersOutput,
  zToBackendGetMembersOutput
} from '#common/types/backend/routes/members/get-members/get-members-output';
import {
  type ToBackendGetMembersError,
  zToBackendGetMembersError
} from './get-members-error';

export type ToBackendGetMembersResponse = ToBackendResponseBase<
  'getMembers',
  ToBackendGetMembersOutput,
  ToBackendGetMembersError
>;

export let zToBackendGetMembersResponse = makeToBackendResponseSchema({
  operation: 'getMembers',
  output: zToBackendGetMembersOutput,
  error: zToBackendGetMembersError
}).meta({ id: 'ToBackendGetMembersResponse' });

assertTypesEqual<
  ToBackendGetMembersResponse,
  z.infer<typeof zToBackendGetMembersResponse>
>({ value: true });
