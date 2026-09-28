import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type ModelX, zModelX } from '#common/zod/backend/model-x';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';

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
