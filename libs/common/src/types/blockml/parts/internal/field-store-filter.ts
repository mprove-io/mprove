import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import {
  type FileStoreFractionControl,
  zFileStoreFractionControl
} from '#common/types/blockml/parts/internal/file-store-fraction-control';
import type { EnumValues } from '#common/types/enum-values';

export type FieldStoreFilter = {
  label?: string;
  label_line_num?: number;
  description?: string;
  description_line_num?: number;
  max_fractions?: number;
  max_fractions_line_num?: number;
  required?: string;
  required_line_num?: number;
  fraction_controls?: FileStoreFractionControl[];
  fraction_controls_line_num?: number;
  name?: string;
  name_line_num?: number;
  fieldClass?: EnumValues<typeof FieldClassEnum>;
  apiFractions?: Fraction[];
};

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

assertTypesEqual<FieldStoreFilter, z.infer<typeof zFieldStoreFilter>>({
  value: true
});
