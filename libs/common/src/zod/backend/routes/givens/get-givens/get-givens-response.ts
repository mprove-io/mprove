import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetGivensError,
  zToBackendGetGivensError
} from './get-givens-error';

export type ToBackendGetGivensOutput = {
  userMember: Member;
  givens: Given[];
};

export type ToBackendGetGivensResponse = ToBackendResponse<
  ToBackendGetGivensOutput,
  ToBackendGetGivensError
>;

export let zToBackendGetGivensOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendGetGivensOutput' });

export let zToBackendGetGivensResponse = makeToBackendResponseSchema({
  success: zToBackendGetGivensOutput,
  error: zToBackendGetGivensError
}).meta({ id: 'ToBackendGetGivensResponse' });

assertTypesEqual<
  ToBackendGetGivensOutput,
  z.infer<typeof zToBackendGetGivensOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetGivensResponse,
  z.infer<typeof zToBackendGetGivensResponse>
>({ value: true });
