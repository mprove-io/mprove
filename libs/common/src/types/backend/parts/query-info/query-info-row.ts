import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoQuery,
  zQueryInfoQuery
} from '#common/types/backend/parts/query-info/query-info-query';
import {
  type Parameter,
  zParameter
} from '#common/types/blockml/parts/report/row/parameter';
import {
  type RowType,
  zRowType
} from '#common/types/blockml/parts/report/row/row-type';

export type QueryInfoRow = {
  rowId: string;
  name: string;
  rowType: RowType;
  metricId: string;
  formula: string;
  parameters: Parameter[];
  query?: QueryInfoQuery;
  records?: any[];
};

export let zQueryInfoRow = z
  .object({
    rowId: z.string(),
    name: z.string(),
    rowType: zRowType,
    metricId: z.string(),
    formula: z.string(),
    parameters: z.array(zParameter),
    query: zQueryInfoQuery.nullish(),
    records: z.array(z.any()).nullish()
  })
  .meta({ id: 'QueryInfoRow' });

assertTypesEqual<QueryInfoRow, z.infer<typeof zQueryInfoRow>>({ value: true });
