import { z } from 'zod';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Listener, zListener } from '#common/types/blockml/listener';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/types/blockml/report-field';
import { type RowChange, zRowChange } from '#common/types/blockml/row-change';
import { zTimezone } from '#common/types/z-timezone';

export type ToBackendCreateDraftReportRequest = {
  operation: 'createDraftReport';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fromReportId: string;
    changeType:
      | ChangeTypeEnum.AddEmpty
      | ChangeTypeEnum.AddMetric
      | ChangeTypeEnum.AddHeader
      | ChangeTypeEnum.AddFormula
      | ChangeTypeEnum.EditInfo
      | ChangeTypeEnum.EditChart
      | ChangeTypeEnum.EditFormula
      | ChangeTypeEnum.EditParameters
      | ChangeTypeEnum.EditListeners
      | ChangeTypeEnum.Delete
      | ChangeTypeEnum.Move;
    rowChange?: RowChange;
    rowIds?: string[];
    timezone: string;
    timeSpec:
      | TimeSpecEnum.Timestamps
      | TimeSpecEnum.Seconds
      | TimeSpecEnum.Minutes
      | TimeSpecEnum.Hours
      | TimeSpecEnum.Days
      | TimeSpecEnum.Weeks
      | TimeSpecEnum.Months
      | TimeSpecEnum.Quarters
      | TimeSpecEnum.Years;
    timeRangeFractionBrick: string;
    newReportFields: ReportField[];
    listeners?: Listener[];
    chart: MconfigChart;
  };
};

export let zToBackendCreateDraftReportRequest = z
  .strictObject({
    operation: z.literal('createDraftReport'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fromReportId: z.string(),
        changeType: z.enum(ChangeTypeEnum),
        rowChange: zRowChange.nullish(),
        rowIds: z.array(z.string()).nullish(),
        timezone: zTimezone,
        timeSpec: z.enum(TimeSpecEnum),
        timeRangeFractionBrick: z.string(),
        newReportFields: z.array(zReportField),
        listeners: z.array(zListener).nullish(),
        chart: zMconfigChart
      })
      .meta({ id: 'ToBackendCreateDraftReportInput' })
  })
  .meta({ id: 'ToBackendCreateDraftReportRequest' });

assertTypesEqual<
  ToBackendCreateDraftReportRequest,
  z.infer<typeof zToBackendCreateDraftReportRequest>
>({ value: true });
