import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteGivenError,
  zToBackendDeleteGivenError
} from './delete-given-error';

export type ToBackendDeleteGivenOutput = {
  userMember: Member;
  givens: Given[];
};

export type ToBackendDeleteGivenResponse = ToBackendResponse<
  ToBackendDeleteGivenOutput,
  ToBackendDeleteGivenError
>;

export let zToBackendDeleteGivenOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendDeleteGivenOutput' });

export let zToBackendDeleteGivenResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteGivenOutput,
  error: zToBackendDeleteGivenError
}).meta({ id: 'ToBackendDeleteGivenResponse' });

assertTypesEqual<
  ToBackendDeleteGivenOutput,
  z.infer<typeof zToBackendDeleteGivenOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteGivenResponse,
  z.infer<typeof zToBackendDeleteGivenResponse>
>({ value: true });
