import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ModelX, zModelX } from '#common/zod/backend/model-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type ToBackendGetModelError,
  zToBackendGetModelError
} from './get-model-error';

export type ToBackendGetModelOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  model: ModelX;
};

export type ToBackendGetModelResponse = ToBackendResponse<
  ToBackendGetModelOutput,
  ToBackendGetModelError
>;

export let zToBackendGetModelOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    model: zModelX
  })
  .meta({ id: 'ToBackendGetModelOutput' });

export let zToBackendGetModelResponse = makeToBackendResponseSchema({
  success: zToBackendGetModelOutput,
  error: zToBackendGetModelError
}).meta({ id: 'ToBackendGetModelResponse' });

assertTypesEqual<
  ToBackendGetModelOutput,
  z.infer<typeof zToBackendGetModelOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetModelResponse,
  z.infer<typeof zToBackendGetModelResponse>
>({ value: true });
