import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteMemberOutput,
  zToBackendDeleteMemberOutput
} from '#common/types/backend/routes/members/delete-member/delete-member-output';
import {
  type ToBackendDeleteMemberError,
  zToBackendDeleteMemberError
} from './delete-member-error';

export type ToBackendDeleteMemberResponse = ToBackendResponseBase<
  'deleteMember',
  ToBackendDeleteMemberOutput,
  ToBackendDeleteMemberError
>;

export let zToBackendDeleteMemberResponse = makeToBackendResponseSchema({
  operation: 'deleteMember',
  output: zToBackendDeleteMemberOutput,
  error: zToBackendDeleteMemberError
}).meta({ id: 'ToBackendDeleteMemberResponse' });

assertTypesEqual<
  ToBackendDeleteMemberResponse,
  z.infer<typeof zToBackendDeleteMemberResponse>
>({ value: true });
