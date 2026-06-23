import { z } from 'zod';
import {
  type ReportTreeNode,
  zReportTreeNode
} from '#common/zod/backend/report-tree-node';

export let zReportSpace = z.object({
  type: z.literal('reportSpace'),
  id: z.string(),
  space: z.string(),
  filePath: z.string(),
  title: z.string(),
  accessRoles: z.array(z.string()),
  accessRolesCombined: z.array(z.string()),
  isSynthetic: z.boolean(),
  get children() {
    return z.array(zReportTreeNode);
  }
});

export type ReportSpace = {
  type: 'reportSpace';
  id: string;
  space: string;
  filePath: string;
  title: string;
  accessRoles: string[];
  accessRolesCombined: string[];
  isSynthetic: boolean;
  children: ReportTreeNode[];
};
