import { z } from 'zod';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';
import { zKeyValuePair } from '#common/types/blockml/key-value-pair';

export let zModelField = z
  .object({
    id: z.string(),
    malloyFieldName: z.string().nullish(),
    malloyFieldPath: z.array(z.string()).nullish(),
    malloyBaseFieldId: z.string().nullish(),
    malloyTags: z.array(zKeyValuePair).nullish(),
    mproveTags: z.array(zKeyValuePair).nullish(),
    hidden: z.boolean(),
    required: z.boolean(),
    maxFractions: z.number().nullish(),
    label: z.string(),
    fieldClass: z.enum(FieldClassEnum),
    fieldFileName: z.string().nullish(),
    fieldFilePath: z.string().nullish(),
    result: z.enum(FieldResultEnum).nullish(),
    fieldLineNum: z.number().int().nullish(),
    suggestModelDimension: z.string().nullish(),
    sqlName: z.string(),
    topId: z.string(),
    topLabel: z.string(),
    description: z.string().nullish(),
    type: z.enum(FieldTypeEnum).nullish(),
    groupId: z.string().nullish(),
    groupLabel: z.string().nullish(),
    groupDescription: z.string().nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish(),
    buildMetrics: z.boolean().nullish(),
    isTimeframeBase: z.boolean(),
    timeframe: z.string().nullish(),
    detail: z.enum(DetailUnitEnum).nullish()
  })
  .meta({ id: 'ModelField' });

export type ModelField = z.infer<typeof zModelField>;
