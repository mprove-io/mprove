import { z } from 'zod';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type Parameter,
  zParameter
} from '#common/types/blockml/parts/parameter';
import type { EnumValues } from '#common/types/enum-values';

export type RowChange = {
  rowId?: string;
  name?: string;
  rowType?: EnumValues<typeof RowTypeEnum>;
  metricId?: string;
  formula?: string;
  showChart?: boolean;
  parameters?: Parameter[];
  formatNumber?: string;
  currencyPrefix?: string;
  currencySuffix?: string;
};

export let zRowChange = z
  .object({
    rowId: z.string().nullish(),
    name: z.string().nullish(),
    rowType: z.enum(RowTypeEnum).nullish(),
    metricId: z.string().nullish(),
    formula: z.string().nullish(),
    showChart: z.boolean().nullish(),
    parameters: z.array(zParameter).nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish()
  })
  .meta({ id: 'RowChange' });

assertTypesEqual<RowChange, z.infer<typeof zRowChange>>({ value: true });
