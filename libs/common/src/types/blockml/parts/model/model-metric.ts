import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionType,
  zConnectionType
} from '#common/types/backend/parts/connection-parts/connection-type';
import {
  type FieldClass,
  zFieldClass
} from '#common/types/blockml/parts/field/field-class';
import {
  type FieldResult,
  zFieldResult
} from '#common/types/blockml/parts/field/field-result';
import {
  type MetricType,
  zMetricType
} from '#common/types/blockml/parts/model/metric-type';
import {
  type ModelType,
  zModelType
} from '#common/types/blockml/parts/model/model-type';

export type ModelMetric = {
  modelId?: string;
  modelType: ModelType;
  connectionType: ConnectionType;
  fieldId: string;
  fieldClass: FieldClass;
  fieldResult?: FieldResult;
  timeFieldId: string;
  structId: string;
  filePath?: string;
  fieldLineNum?: number;
  type: MetricType;
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
    modelType: zModelType,
    connectionType: zConnectionType,
    fieldId: z.string(),
    fieldClass: zFieldClass,
    fieldResult: zFieldResult.nullish(),
    timeFieldId: z.string(),
    structId: z.string(),
    filePath: z.string().nullish(),
    fieldLineNum: z.number().int().nullish(),
    type: zMetricType,
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
