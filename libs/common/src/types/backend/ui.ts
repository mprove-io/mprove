import { z } from 'zod';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zProjectChartLink } from '#common/types/backend/project-chart-link';
import { zProjectDashboardLink } from '#common/types/backend/project-dashboard-link';
import { zProjectExplorerSessionLink } from '#common/types/backend/project-explorer-session-link';
import { zProjectModelLink } from '#common/types/backend/project-model-link';
import { zProjectReportLink } from '#common/types/backend/project-report-link';
import { zProjectSelectedGivenLink } from '#common/types/backend/project-selected-given-link';
import { zFraction } from '#common/types/blockml/fraction';
import { zTimezone } from '#common/types/z-timezone';

export let zUi = z
  .object({
    modelTreeLevels: z.enum(ModelTreeLevelsEnum),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFraction: zFraction,
    projectModelLinks: z.array(zProjectModelLink),
    projectChartLinks: z.array(zProjectChartLink),
    projectDashboardLinks: z.array(zProjectDashboardLink),
    projectExplorerSessionLinks: z.array(zProjectExplorerSessionLink).nullish(),
    projectReportLinks: z.array(zProjectReportLink),
    projectSelectedGivenLinks: z.array(zProjectSelectedGivenLink).nullish(),
    chartsByModel: z.boolean().nullish(),
    permissionsAutoAcceptSessionIds: z.array(z.string()).nullish(),
    newSessionPermissionsAutoAccept: z.boolean().nullish(),
    newSessionExplorerModelExtraId: z.string().nullish(),
    newSessionExplorerVariant: z.string().nullish(),
    newSessionEditorModelExtraId: z.string().nullish(),
    newSessionEditorVariant: z.string().nullish()
  })
  .meta({ id: 'Ui' });

export type Ui = z.infer<typeof zUi>;
