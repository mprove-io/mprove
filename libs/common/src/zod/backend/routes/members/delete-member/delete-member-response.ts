import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteMemberError,
  zToBackendDeleteMemberError
} from './delete-member-error';

export type ToBackendDeleteMemberOutput = Record<string, never>;

export type ToBackendDeleteMemberResponse = ToBackendResponse<
  ToBackendDeleteMemberOutput,
  ToBackendDeleteMemberError
>;

export let zToBackendDeleteMemberOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteMemberOutput' });

export let zToBackendDeleteMemberResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteMemberOutput,
  error: zToBackendDeleteMemberError
}).meta({ id: 'ToBackendDeleteMemberResponse' });

assertTypesEqual<
  ToBackendDeleteMemberOutput,
  z.infer<typeof zToBackendDeleteMemberOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteMemberResponse,
  z.infer<typeof zToBackendDeleteMemberResponse>
>({ value: true });
