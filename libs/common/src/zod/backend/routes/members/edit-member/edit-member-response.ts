import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendEditMemberOutput,
  zToBackendEditMemberOutput
} from '#common/zod/backend/routes/members/edit-member/edit-member-output';
import {
  type ToBackendEditMemberError,
  zToBackendEditMemberError
} from './edit-member-error';

export type ToBackendEditMemberResponse = ToBackendResponseBase<
  'editMember',
  ToBackendEditMemberOutput,
  ToBackendEditMemberError
>;

export let zToBackendEditMemberResponse = makeToBackendResponseSchema({
  operation: 'editMember',
  output: zToBackendEditMemberOutput,
  error: zToBackendEditMemberError
}).meta({ id: 'ToBackendEditMemberResponse' });

assertTypesEqual<
  ToBackendEditMemberResponse,
  z.infer<typeof zToBackendEditMemberResponse>
>({ value: true });
