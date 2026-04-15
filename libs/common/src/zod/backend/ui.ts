import { z } from 'zod';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zProjectChartLink } from '#common/zod/backend/project-chart-link';
import { zProjectDashboardLink } from '#common/zod/backend/project-dashboard-link';
import { zProjectModelLink } from '#common/zod/backend/project-model-link';
import { zProjectReportLink } from '#common/zod/backend/project-report-link';
import { zFraction } from '#common/zod/blockml/fraction';

export let zUi = z
  .object({
    modelTreeLevels: z.enum(ModelTreeLevelsEnum),
    timezone: z.string(),
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFraction: zFraction,
    projectModelLinks: z.array(zProjectModelLink),
    projectChartLinks: z.array(zProjectChartLink),
    projectDashboardLinks: z.array(zProjectDashboardLink),
    projectReportLinks: z.array(zProjectReportLink),
    permissionsAutoAcceptSessionIds: z.array(z.string()).nullish(),
    newSessionPermissionsAutoAccept: z.boolean().nullish(),
    newSessionExplorerProviderModel: z.string().nullish(),
    newSessionEditorProviderModel: z.string().nullish(),
    newSessionEditorVariant: z.string().nullish(),
    newSessionUseCodex: z.boolean().nullish()
  })
  .meta({ id: 'Ui' });

export type Ui = z.infer<typeof zUi>;
