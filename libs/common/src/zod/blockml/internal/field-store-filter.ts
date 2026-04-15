import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { zFraction } from '#common/zod/blockml/fraction';
import { zFileStoreFractionControl } from '#common/zod/blockml/internal/file-store-fraction-control';

export let zFieldStoreFilter = z
  .object({
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    max_fractions: z.number().nullish(),
    max_fractions_line_num: z.number().nullish(),
    required: z.string().nullish(),
    required_line_num: z.number().nullish(),
    fraction_controls: z.array(zFileStoreFractionControl).nullish(),
    fraction_controls_line_num: z.number().nullish(),
    name: z.string().nullish(),
    name_line_num: z.number().nullish(),
    fieldClass: z.enum(FieldClassEnum).nullish(),
    apiFractions: z.array(zFraction).nullish()
  })
  .meta({ id: 'FieldStoreFilter' });

export type FieldStoreFilter = z.infer<typeof zFieldStoreFilter>;
