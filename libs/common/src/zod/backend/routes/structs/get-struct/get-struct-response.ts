import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendGetStructError,
  zToBackendGetStructError
} from './get-struct-error';

export type ToBackendGetStructOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
};

export type ToBackendGetStructResponse = ToBackendResponse<
  ToBackendGetStructOutput,
  ToBackendGetStructError
>;

export let zToBackendGetStructOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetStructOutput' });

export let zToBackendGetStructResponse = makeToBackendResponseSchema({
  success: zToBackendGetStructOutput,
  error: zToBackendGetStructError
}).meta({ id: 'ToBackendGetStructResponse' });

assertTypesEqual<
  ToBackendGetStructOutput,
  z.infer<typeof zToBackendGetStructOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetStructResponse,
  z.infer<typeof zToBackendGetStructResponse>
>({ value: true });
