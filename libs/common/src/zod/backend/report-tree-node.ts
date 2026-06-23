import { z } from 'zod';
import {
  type ReportSpace,
  zReportSpace
} from '#common/zod/backend/report-space';
import { type ReportUnit, zReportUnit } from '#common/zod/backend/report-unit';

export let zReportTreeNode: z.ZodType<ReportTreeNode> = z.discriminatedUnion(
  'type',
  [zReportSpace, zReportUnit]
);

export type ReportTreeNode = ReportSpace | ReportUnit;
