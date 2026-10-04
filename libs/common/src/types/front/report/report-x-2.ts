import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { Extend } from '#common/types/extend';
import type { RowX2 } from '#common/types/front/report/row/row-x-2';

export type ReportX2 = Extend<ReportX, { rows: RowX2[] }>;
