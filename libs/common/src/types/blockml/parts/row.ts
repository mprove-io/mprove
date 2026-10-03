import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigX,
  zMconfigX
} from '#common/types/backend/parts/mconfig-x';
import { type Filter, zFilter } from '#common/types/blockml/parts/filter';
import {
  type Parameter,
  zParameter
} from '#common/types/blockml/parts/parameter';
import { type Query, zQuery } from '#common/types/blockml/parts/query';
import {
  type RowRecord,
  zRowRecord
} from '#common/types/blockml/parts/row-record';
import { type Rq, zRq } from '#common/types/blockml/parts/rq';
import type { EnumValues } from '#common/types/enum-values';

export type Row = {
  rowId: string;
  name: string;
  rowType: EnumValues<typeof RowTypeEnum>;
  metricId: string;
  modelId: string;
  topLabel: string;
  partNodeLabel: string;
  partFieldLabel: string;
  partLabel: string;
  timeNodeLabel: string;
  timeFieldLabel: string;
  timeLabel: string;
  formulaError?: string;
  topQueryError?: string;
  hasAccessToModel: boolean;
  mconfig: MconfigX;
  query: Query;
  showChart: boolean;
  rqs: Rq[];
  records: RowRecord[];
  formatNumber: string;
  currencyPrefix: string;
  currencySuffix: string;
  parameters: Parameter[];
  parametersFiltersWithExcludedTime: Filter[];
  formula: string;
  formulaDeps: string[];
  deps: string[];
};

export let zRow = z
  .object({
    rowId: z.string(),
    name: z.string(),
    rowType: z.enum(RowTypeEnum),
    metricId: z.string(),
    modelId: z.string(),
    topLabel: z.string(),
    partNodeLabel: z.string(),
    partFieldLabel: z.string(),
    partLabel: z.string(),
    timeNodeLabel: z.string(),
    timeFieldLabel: z.string(),
    timeLabel: z.string(),
    formulaError: z.string().nullish(),
    topQueryError: z.string().nullish(),
    hasAccessToModel: z.boolean(),
    mconfig: zMconfigX,
    query: zQuery,
    showChart: z.boolean(),
    rqs: z.array(zRq),
    records: z.array(zRowRecord),
    formatNumber: z.string(),
    currencyPrefix: z.string(),
    currencySuffix: z.string(),
    parameters: z.array(zParameter),
    parametersFiltersWithExcludedTime: z.array(zFilter),
    formula: z.string(),
    formulaDeps: z.array(z.string()),
    deps: z.array(z.string())
  })
  .meta({ id: 'Row' });

assertTypesEqual<Row, z.infer<typeof zRow>>({ value: true });
