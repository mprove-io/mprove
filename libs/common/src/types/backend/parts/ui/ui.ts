import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectChartLink,
  zProjectChartLink
} from '#common/types/backend/parts/project-chart-link';
import {
  type ProjectDashboardLink,
  zProjectDashboardLink
} from '#common/types/backend/parts/project-dashboard-link';
import {
  type ProjectExplorerSessionLink,
  zProjectExplorerSessionLink
} from '#common/types/backend/parts/project-explorer-session-link';
import {
  type ProjectModelLink,
  zProjectModelLink
} from '#common/types/backend/parts/project-model-link';
import {
  type ProjectReportLink,
  zProjectReportLink
} from '#common/types/backend/parts/project-report-link';
import {
  type ProjectSelectedGivenLink,
  zProjectSelectedGivenLink
} from '#common/types/backend/parts/project-selected-given-link';
import {
  type ModelTreeLevel,
  zModelTreeLevel
} from '#common/types/backend/parts/ui/model-tree-level';
import {
  type Fraction,
  zFraction
} from '#common/types/blockml/parts/fraction/fraction';
import { type TimeSpec, zTimeSpec } from '#common/types/shared/time/timespec';

import {
  type TimezoneString,
  zTimezone
} from '#common/types/shared/timezone/z-timezone';

export type Ui = {
  modelTreeLevels: ModelTreeLevel;
  timezone: TimezoneString;
  timeSpec: TimeSpec;
  timeRangeFraction: Fraction;
  projectModelLinks: ProjectModelLink[];
  projectChartLinks: ProjectChartLink[];
  projectDashboardLinks: ProjectDashboardLink[];
  projectExplorerSessionLinks?: ProjectExplorerSessionLink[];
  projectReportLinks: ProjectReportLink[];
  projectSelectedGivenLinks?: ProjectSelectedGivenLink[];
  chartsByModel?: boolean;
  permissionsAutoAcceptSessionIds?: string[];
  newSessionPermissionsAutoAccept?: boolean;
  newSessionExplorerModelExtraId?: string;
  newSessionExplorerVariant?: string;
  newSessionEditorModelExtraId?: string;
  newSessionEditorVariant?: string;
};

export let zUi = z
  .object({
    modelTreeLevels: zModelTreeLevel,
    timezone: zTimezone,
    timeSpec: zTimeSpec,
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

assertTypesEqual<Ui, z.infer<typeof zUi>>({ value: true });
