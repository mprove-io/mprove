import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetMemberGivensOutput,
  zToBackendGetMemberGivensOutput
} from '#common/types/backend/routes/members/get-member-givens/get-member-givens-output';
import {
  type ToBackendGetMemberGivensError,
  zToBackendGetMemberGivensError
} from './get-member-givens-error';

export type ToBackendGetMemberGivensResponse = ToBackendResponseBase<
  'getMemberGivens',
  ToBackendGetMemberGivensOutput,
  ToBackendGetMemberGivensError
>;

export let zToBackendGetMemberGivensResponse = makeToBackendResponseSchema({
  operation: 'getMemberGivens',
  output: zToBackendGetMemberGivensOutput,
  error: zToBackendGetMemberGivensError
}).meta({ id: 'ToBackendGetMemberGivensResponse' });

assertTypesEqual<
  ToBackendGetMemberGivensResponse,
  z.infer<typeof zToBackendGetMemberGivensResponse>
>({ value: true });
