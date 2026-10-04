import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';

export type ToBackendGetStructOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
};

export let zToBackendGetStructOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetStructOutput' });

assertTypesEqual<
  ToBackendGetStructOutput,
  z.infer<typeof zToBackendGetStructOutput>
>({ value: true });
