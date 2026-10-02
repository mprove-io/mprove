import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

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

export type SuggestField = z.infer<typeof zSuggestField>;
