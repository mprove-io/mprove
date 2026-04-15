import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { MetricTypeEnum } from '#common/enums/metric-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';

export let zModelMetric = z
  .object({
    modelId: z.string(),
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

export type ModelMetric = z.infer<typeof zModelMetric>;
