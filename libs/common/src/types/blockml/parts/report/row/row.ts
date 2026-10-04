import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigX,
  zMconfigX
} from '#common/types/backend/parts/mconfig/mconfig-x';
import {
  type Filter,
  zFilter
} from '#common/types/blockml/parts/filter/filter';
import { type Query, zQuery } from '#common/types/blockml/parts/query/query';
import {
  type Parameter,
  zParameter
} from '#common/types/blockml/parts/report/row/parameter';
import {
  type RowRecord,
  zRowRecord
} from '#common/types/blockml/parts/report/row/row-record';
import {
  type RowType,
  zRowType
} from '#common/types/blockml/parts/report/row/row-type';
import { type Rq, zRq } from '#common/types/blockml/parts/report/row/rq';

export type Row = {
  rowId: string;
  name: string;
  rowType: RowType;
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
    rowType: zRowType,
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
