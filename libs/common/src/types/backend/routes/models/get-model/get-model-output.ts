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

export type ToBackendGetModelOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  model: ModelX;
};

export let zToBackendGetModelOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    model: zModelX
  })
  .meta({ id: 'ToBackendGetModelOutput' });

assertTypesEqual<
  ToBackendGetModelOutput,
  z.infer<typeof zToBackendGetModelOutput>
>({ value: true });
