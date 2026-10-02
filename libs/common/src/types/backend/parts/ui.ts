import { z } from 'zod';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zProjectChartLink } from '#common/types/backend/parts/project-chart-link';
import { zProjectDashboardLink } from '#common/types/backend/parts/project-dashboard-link';
import { zProjectExplorerSessionLink } from '#common/types/backend/parts/project-explorer-session-link';
import { zProjectModelLink } from '#common/types/backend/parts/project-model-link';
import { zProjectReportLink } from '#common/types/backend/parts/project-report-link';
import { zProjectSelectedGivenLink } from '#common/types/backend/parts/project-selected-given-link';
import { zFraction } from '#common/types/blockml/parts/fraction';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

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
