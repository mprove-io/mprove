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
  type ToBackendGetModelsError,
  zToBackendGetModelsError
} from './get-models-error';

export type ToBackendGetModelsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  models: ModelX[];
};

export type ToBackendGetModelsResponse = ToBackendResponse<
  ToBackendGetModelsOutput,
  ToBackendGetModelsError
>;

export let zToBackendGetModelsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX)
  })
  .meta({ id: 'ToBackendGetModelsOutput' });

export let zToBackendGetModelsResponse = makeToBackendResponseSchema({
  success: zToBackendGetModelsOutput,
  error: zToBackendGetModelsError
}).meta({ id: 'ToBackendGetModelsResponse' });

assertTypesEqual<
  ToBackendGetModelsOutput,
  z.infer<typeof zToBackendGetModelsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetModelsResponse,
  z.infer<typeof zToBackendGetModelsResponse>
>({ value: true });
