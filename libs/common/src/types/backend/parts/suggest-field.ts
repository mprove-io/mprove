import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type SuggestField = {
  modelFieldRef: string;
  connectionType: EnumValues<typeof ConnectionTypeEnum>;
  topLabel: string;
  partNodeLabel: string;
  partFieldLabel: string;
  partLabel: string;
  fieldClass: EnumValues<typeof FieldClassEnum>;
  result: EnumValues<typeof FieldResultEnum>;
};

export let zSuggestField = z
  .object({
    modelFieldRef: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    topLabel: z.string(),
    partNodeLabel: z.string(),
    partFieldLabel: z.string(),
    partLabel: z.string(),
    fieldClass: z.enum(FieldClassEnum),
    result: z.enum(FieldResultEnum)
  })
  .meta({ id: 'SuggestField' });

assertTypesEqual<SuggestField, z.infer<typeof zSuggestField>>({ value: true });
