import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/parts/mconfig/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/types/blockml/parts/report/report-field';
import type { ChangeType } from '#common/types/blockml/parts/report/row/change-type';
import { zChangeType } from '#common/types/blockml/parts/report/row/change-type';
import {
  type Listener,
  zListener
} from '#common/types/blockml/parts/report/row/listener';
import {
  type RowChange,
  zRowChange
} from '#common/types/blockml/parts/report/row/row-change';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { zTimeSpec } from '#common/types/shared/time/timespec';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

export type ToBackendEditDraftReportRequest = {
  operation: 'editDraftReport';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    reportId: string;
    changeType: ChangeType;
    rowChange?: RowChange;
    rowIds?: string[];
    timezone: string;
    timeSpec: TimeSpec;
    timeRangeFractionBrick: string;
    newReportFields: ReportField[];
    listeners?: Listener[];
    chart: MconfigChart;
  };
};

export let zToBackendEditDraftReportRequest = z
  .strictObject({
    operation: z.literal('editDraftReport'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        reportId: z.string(),
        changeType: zChangeType,
        rowChange: zRowChange.nullish(),
        rowIds: z.array(z.string()).nullish(),
        timezone: zTimezone,
        timeSpec: zTimeSpec,
        timeRangeFractionBrick: z.string(),
        newReportFields: z.array(zReportField),
        listeners: z.array(zListener).nullish(),
        chart: zMconfigChart
      })
      .meta({ id: 'ToBackendEditDraftReportInput' })
  })
  .meta({ id: 'ToBackendEditDraftReportRequest' });

assertTypesEqual<
  ToBackendEditDraftReportRequest,
  z.infer<typeof zToBackendEditDraftReportRequest>
>({ value: true });
