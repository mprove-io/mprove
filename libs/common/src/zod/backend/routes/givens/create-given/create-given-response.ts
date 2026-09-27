import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateGivenError,
  zToBackendCreateGivenError
} from './create-given-error';

export type ToBackendCreateGivenOutput = {
  userMember: Member;
  givens: Given[];
};

export type ToBackendCreateGivenResponse = ToBackendResponse<
  ToBackendCreateGivenOutput,
  ToBackendCreateGivenError
>;

export let zToBackendCreateGivenOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendCreateGivenOutput' });

export let zToBackendCreateGivenResponse = makeToBackendResponseSchema({
  success: zToBackendCreateGivenOutput,
  error: zToBackendCreateGivenError
}).meta({ id: 'ToBackendCreateGivenResponse' });

assertTypesEqual<
  ToBackendCreateGivenOutput,
  z.infer<typeof zToBackendCreateGivenOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateGivenResponse,
  z.infer<typeof zToBackendCreateGivenResponse>
>({ value: true });
