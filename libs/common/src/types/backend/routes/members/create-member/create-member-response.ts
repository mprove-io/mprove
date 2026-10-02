import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateMemberOutput,
  zToBackendCreateMemberOutput
} from '#common/types/backend/routes/members/create-member/create-member-output';
import {
  type ToBackendCreateMemberError,
  zToBackendCreateMemberError
} from './create-member-error';

export type ToBackendCreateMemberResponse = ToBackendResponseBase<
  'createMember',
  ToBackendCreateMemberOutput,
  ToBackendCreateMemberError
>;

export let zToBackendCreateMemberResponse = makeToBackendResponseSchema({
  operation: 'createMember',
  output: zToBackendCreateMemberOutput,
  error: zToBackendCreateMemberError
}).meta({ id: 'ToBackendCreateMemberResponse' });

assertTypesEqual<
  ToBackendCreateMemberResponse,
  z.infer<typeof zToBackendCreateMemberResponse>
>({ value: true });
