import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditGivenError,
  zToBackendEditGivenError
} from './edit-given-error';

export type ToBackendEditGivenOutput = {
  userMember: Member;
  givens: Given[];
};

export type ToBackendEditGivenResponse = ToBackendResponse<
  ToBackendEditGivenOutput,
  ToBackendEditGivenError
>;

export let zToBackendEditGivenOutput = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendEditGivenOutput' });

export let zToBackendEditGivenResponse = makeToBackendResponseSchema({
  success: zToBackendEditGivenOutput,
  error: zToBackendEditGivenError
}).meta({ id: 'ToBackendEditGivenResponse' });

assertTypesEqual<
  ToBackendEditGivenOutput,
  z.infer<typeof zToBackendEditGivenOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditGivenResponse,
  z.infer<typeof zToBackendEditGivenResponse>
>({ value: true });
