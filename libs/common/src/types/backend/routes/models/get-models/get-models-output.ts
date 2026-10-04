import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type ModelX,
  zModelX
} from '#common/types/backend/parts/model/model-x';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';

export type ToBackendGetModelsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  models: ModelX[];
};

export let zToBackendGetModelsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    models: z.array(zModelX)
  })
  .meta({ id: 'ToBackendGetModelsOutput' });

assertTypesEqual<
  ToBackendGetModelsOutput,
  z.infer<typeof zToBackendGetModelsOutput>
>({ value: true });
