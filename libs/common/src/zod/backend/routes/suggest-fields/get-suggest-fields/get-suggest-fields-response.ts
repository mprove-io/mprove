import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import {
  type SuggestField,
  zSuggestField
} from '#common/zod/backend/suggest-field';
import {
  type ToBackendGetSuggestFieldsError,
  zToBackendGetSuggestFieldsError
} from './get-suggest-fields-error';

export type ToBackendGetSuggestFieldsOutput = {
  needValidate: boolean;
  struct: StructX;
  userMember: Member;
  suggestFields: SuggestField[];
};

export type ToBackendGetSuggestFieldsResponse = ToBackendResponse<
  ToBackendGetSuggestFieldsOutput,
  ToBackendGetSuggestFieldsError
>;

export let zToBackendGetSuggestFieldsOutput = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    suggestFields: z.array(zSuggestField)
  })
  .meta({ id: 'ToBackendGetSuggestFieldsOutput' });

export let zToBackendGetSuggestFieldsResponse = makeToBackendResponseSchema({
  success: zToBackendGetSuggestFieldsOutput,
  error: zToBackendGetSuggestFieldsError
}).meta({ id: 'ToBackendGetSuggestFieldsResponse' });

assertTypesEqual<
  ToBackendGetSuggestFieldsOutput,
  z.infer<typeof zToBackendGetSuggestFieldsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSuggestFieldsResponse,
  z.infer<typeof zToBackendGetSuggestFieldsResponse>
>({ value: true });
