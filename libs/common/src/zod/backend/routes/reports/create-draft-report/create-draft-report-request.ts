import { z } from 'zod';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Listener, zListener } from '#common/zod/blockml/listener';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/zod/blockml/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/zod/blockml/report-field';
import { type RowChange, zRowChange } from '#common/zod/blockml/row-change';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendCreateDraftReportInput = {
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

export type ToBackendCreateDraftReportRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateDraftReportInput;
};

export let zToBackendCreateDraftReportInput = z
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
  .meta({ id: 'ToBackendCreateDraftReportInput' });

export let zToBackendCreateDraftReportRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateDraftReportInput
  })
  .meta({ id: 'ToBackendCreateDraftReportRequest' });

assertTypesEqual<
  ToBackendCreateDraftReportInput,
  z.infer<typeof zToBackendCreateDraftReportInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateDraftReportRequest,
  z.infer<typeof zToBackendCreateDraftReportRequest>
>({ value: true });
