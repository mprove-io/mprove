import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Column, zColumn } from '#common/types/blockml/parts/column';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/parts/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/types/blockml/parts/report-field';
import { type Row, zRow } from '#common/types/blockml/parts/row';
import type { EnumValues } from '#common/types/enum-values';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';
import {
  type TimezoneString,
  zTimezone
} from '#common/types/shared/timezone/z-timezone';

export type Report = {
  projectId: string;
  structId: string;
  reportId: string;
  draft: boolean;
  creatorId: string;
  filePath: string;
  space?: string;
  fields: ReportField[];
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  title: string;
  timezone: TimezoneString;
  timeSpec: EnumValues<typeof TimeSpecEnum>;
  timeRangeFraction: Fraction;
  rangeStart?: number;
  rangeEnd?: number;
  columns: Column[];
  rows: Row[];
  isTimeColumnsLimitExceeded: boolean;
  timeColumnsLimit: number;
  timeColumnsLength: number;
  draftCreatedTs: number;
  chart: MconfigChart;
  serverTs: number;
};

export let zReport = z
  .object({
    projectId: z.string(),
    structId: z.string(),
    reportId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    fields: z.array(zReportField),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    title: z.string(),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFraction: zFraction,
    rangeStart: z.number().nullish(),
    rangeEnd: z.number().nullish(),
    columns: z.array(zColumn),
    rows: z.array(zRow),
    isTimeColumnsLimitExceeded: z.boolean(),
    timeColumnsLimit: z.number().int(),
    timeColumnsLength: z.number().int(),
    draftCreatedTs: z.number().int(),
    chart: zMconfigChart,
    serverTs: z.number().int()
  })
  .meta({ id: 'Report' });

assertTypesEqual<Report, z.infer<typeof zReport>>({ value: true });
