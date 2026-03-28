import { z } from 'zod';
import { DetailUnitEnum } from '#common/enums/detail-unit.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { FieldTypeEnum } from '#common/enums/field-type.enum';
import { zKeyValuePair } from '#common/zod/z-model/z-key-value-pair';

export let zModelField = z.object({
  id: z.string().nullish(),
  malloyFieldName: z.string().nullish(),
  malloyFieldPath: z.array(z.string()).nullish(),
  malloyTags: z.array(zKeyValuePair).nullish(),
  mproveTags: z.array(zKeyValuePair).nullish(),
  hidden: z.boolean().nullish(),
  required: z.boolean().nullish(),
  maxFractions: z.number().nullish(),
  label: z.string().nullish(),
  fieldClass: z.enum(FieldClassEnum).nullish(),
  result: z.enum(FieldResultEnum).nullish(),
  suggestModelDimension: z.string().nullish(),
  sqlName: z.string().nullish(),
  topId: z.string().nullish(),
  topLabel: z.string().nullish(),
  description: z.string().nullish(),
  type: z.enum(FieldTypeEnum).nullish(),
  groupId: z.string().nullish(),
  groupLabel: z.string().nullish(),
  groupDescription: z.string().nullish(),
  formatNumber: z.string().nullish(),
  currencyPrefix: z.string().nullish(),
  currencySuffix: z.string().nullish(),
  buildMetrics: z.boolean().nullish(),
  timeframe: z.string().nullish(),
  detail: z.enum(DetailUnitEnum).nullish()
});
