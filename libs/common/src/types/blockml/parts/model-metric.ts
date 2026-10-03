import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { MetricTypeEnum } from '#common/enums/metric-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type ModelMetric = {
  modelId?: string;
  modelType: EnumValues<typeof ModelTypeEnum>;
  connectionType: EnumValues<typeof ConnectionTypeEnum>;
  fieldId: string;
  fieldClass: EnumValues<typeof FieldClassEnum>;
  fieldResult?: EnumValues<typeof FieldResultEnum>;
  timeFieldId: string;
  structId: string;
  filePath?: string;
  fieldLineNum?: number;
  type: EnumValues<typeof MetricTypeEnum>;
  metricId: string;
  topNode?: string;
  label?: string;
  topLabel?: string;
  partNodeLabel?: string;
  partFieldLabel?: string;
  partLabel?: string;
  timeNodeLabel?: string;
  timeFieldLabel?: string;
  timeLabel?: string;
  description?: string;
  formatNumber?: string;
  currencyPrefix?: string;
  currencySuffix?: string;
  serverTs: number;
};

export let zModelMetric = z
  .object({
    modelId: z.string().nullish(),
    modelType: z.enum(ModelTypeEnum),
    connectionType: z.enum(ConnectionTypeEnum),
    fieldId: z.string(),
    fieldClass: z.enum(FieldClassEnum),
    fieldResult: z.enum(FieldResultEnum).nullish(),
    timeFieldId: z.string(),
    structId: z.string(),
    filePath: z.string().nullish(),
    fieldLineNum: z.number().int().nullish(),
    type: z.enum(MetricTypeEnum),
    metricId: z.string(),
    topNode: z.string().nullish(),
    label: z.string().nullish(),
    topLabel: z.string().nullish(),
    partNodeLabel: z.string().nullish(),
    partFieldLabel: z.string().nullish(),
    partLabel: z.string().nullish(),
    timeNodeLabel: z.string().nullish(),
    timeFieldLabel: z.string().nullish(),
    timeLabel: z.string().nullish(),
    description: z.string().nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish(),
    serverTs: z.number().int()
  })
  .meta({ id: 'ModelMetric' });

assertTypesEqual<ModelMetric, z.infer<typeof zModelMetric>>({ value: true });
