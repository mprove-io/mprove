import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/member';
import { type StructX, zStructX } from '#common/types/backend/struct-x';
import {
  type SuggestField,
  zSuggestField
} from '#common/types/backend/suggest-field';

export type ToBackendGetSuggestFieldsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  suggestFields: SuggestField[];
};

export let zToBackendGetSuggestFieldsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    suggestFields: z.array(zSuggestField)
  })
  .meta({ id: 'ToBackendGetSuggestFieldsOutput' });

assertTypesEqual<
  ToBackendGetSuggestFieldsOutput,
  z.infer<typeof zToBackendGetSuggestFieldsOutput>
>({ value: true });
