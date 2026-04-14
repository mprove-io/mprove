import { z } from 'zod';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';
import { zKeyValuePair } from '#common/zod/blockml/key-value-pair';

export let zModelField = z
  .object({
    id: z.string(),
    malloyFieldName: z.string().optional(),
    malloyFieldPath: z.array(z.string()).optional(),
    malloyTags: z.array(zKeyValuePair).optional(),
    mproveTags: z.array(zKeyValuePair).optional(),
    hidden: z.boolean(),
    required: z.boolean(),
    maxFractions: z.number().optional(),
    label: z.string(),
    fieldClass: z.enum(FieldClassEnum),
    result: z.enum(FieldResultEnum).optional(),
    suggestModelDimension: z.string().optional(),
    sqlName: z.string(),
    topId: z.string(),
    topLabel: z.string(),
    description: z.string().optional(),
    type: z.enum(FieldTypeEnum).optional(),
    groupId: z.string().optional(),
    groupLabel: z.string().optional(),
    groupDescription: z.string().optional(),
    formatNumber: z.string().optional(),
    currencyPrefix: z.string().optional(),
    currencySuffix: z.string().optional(),
    buildMetrics: z.boolean().optional(),
    timeframe: z.string().optional(),
    detail: z.enum(DetailUnitEnum).optional()
  })
  .meta({ id: 'ModelField' });

export type ZModelField = z.infer<typeof zModelField>;
