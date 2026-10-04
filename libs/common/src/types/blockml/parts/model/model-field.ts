import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DetailUnit,
  zDetailUnit
} from '#common/types/blockml/parts/field/detail-unit';
import {
  type FieldClass,
  zFieldClass
} from '#common/types/blockml/parts/field/field-class';
import {
  type FieldResult,
  zFieldResult
} from '#common/types/blockml/parts/field/field-result';
import {
  type FieldType,
  zFieldType
} from '#common/types/blockml/parts/field/field-type';
import {
  type KeyValuePair,
  zKeyValuePair
} from '#common/types/blockml/parts/tag/key-value-pair';

export type ModelField = {
  id: string;
  malloyFieldName?: string;
  malloyFieldPath?: string[];
  malloyBaseFieldId?: string;
  malloyTags?: KeyValuePair[];
  mproveTags?: KeyValuePair[];
  hidden: boolean;
  required: boolean;
  maxFractions?: number;
  label: string;
  fieldClass: FieldClass;
  fieldFileName?: string;
  fieldFilePath?: string;
  result?: FieldResult;
  fieldLineNum?: number;
  suggestModelDimension?: string;
  sqlName: string;
  topId: string;
  topLabel: string;
  description?: string;
  type?: FieldType;
  groupId?: string;
  groupLabel?: string;
  groupDescription?: string;
  formatNumber?: string;
  currencyPrefix?: string;
  currencySuffix?: string;
  buildMetrics?: boolean;
  isTimeframeBase: boolean;
  timeframe?: string;
  detail?: DetailUnit;
};

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
    fieldClass: zFieldClass,
    fieldFileName: z.string().nullish(),
    fieldFilePath: z.string().nullish(),
    result: zFieldResult.nullish(),
    fieldLineNum: z.number().int().nullish(),
    suggestModelDimension: z.string().nullish(),
    sqlName: z.string(),
    topId: z.string(),
    topLabel: z.string(),
    description: z.string().nullish(),
    type: zFieldType.nullish(),
    groupId: z.string().nullish(),
    groupLabel: z.string().nullish(),
    groupDescription: z.string().nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish(),
    buildMetrics: z.boolean().nullish(),
    isTimeframeBase: z.boolean(),
    timeframe: z.string().nullish(),
    detail: zDetailUnit.nullish()
  })
  .meta({ id: 'ModelField' });

assertTypesEqual<ModelField, z.infer<typeof zModelField>>({ value: true });
