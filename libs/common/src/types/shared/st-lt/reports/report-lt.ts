import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Row, zRow } from '#common/types/blockml/parts/row';

export type ReportLt = {
  rows: Row[];
};

export let zReportLt = z
  .object({ rows: z.array(zRow) })
  .meta({ id: 'ReportLt' });

assertTypesEqual<ReportLt, z.infer<typeof zReportLt>>({ value: true });
