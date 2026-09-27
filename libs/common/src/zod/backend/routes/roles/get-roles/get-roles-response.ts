import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/zod/backend/given';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Role, zRole } from '#common/zod/backend/role';
import {
  type ToBackendGetRolesError,
  zToBackendGetRolesError
} from './get-roles-error';

export type ToBackendGetRolesOutput = {
  userMember: Member;
  roles: Role[];
  givens: Given[];
};

export type ToBackendGetRolesResponse = ToBackendResponse<
  ToBackendGetRolesOutput,
  ToBackendGetRolesError
>;

export let zToBackendGetRolesOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole),
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendGetRolesOutput' });

export let zToBackendGetRolesResponse = makeToBackendResponseSchema({
  success: zToBackendGetRolesOutput,
  error: zToBackendGetRolesError
}).meta({ id: 'ToBackendGetRolesResponse' });

assertTypesEqual<
  ToBackendGetRolesOutput,
  z.infer<typeof zToBackendGetRolesOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetRolesResponse,
  z.infer<typeof zToBackendGetRolesResponse>
>({ value: true });
