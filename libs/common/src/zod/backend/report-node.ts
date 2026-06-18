import { z } from 'zod';

export let zReportNode: z.ZodType<ReportNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('space'),
      id: z.string(),
      space: z.string(),
      filePath: z.string(),
      title: z.string(),
      accessRoles: z.array(z.string()),
      accessRolesCombined: z.array(z.string()),
      children: z.array(zReportNode)
    }),
    z.object({
      type: z.literal('report'),
      id: z.string(),
      reportId: z.string(),
      title: z.string(),
      space: z.string().nullish(),
      accessRoles: z.array(z.string()),
      accessRolesCombined: z.array(z.string())
    })
  ])
);

export type ReportNode =
  | {
      type: 'space';
      id: string;
      space: string;
      filePath: string;
      title: string;
      accessRoles: string[];
      accessRolesCombined: string[];
      children: ReportNode[];
    }
  | {
      type: 'report';
      id: string;
      reportId: string;
      title: string;
      space?: string;
      accessRoles: string[];
      accessRolesCombined: string[];
    };
