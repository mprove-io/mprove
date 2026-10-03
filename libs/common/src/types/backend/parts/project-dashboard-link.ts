import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectDashboardLink = {
  projectId: string;
  dashboardId: string;
  navTs?: number;
};

export let zProjectDashboardLink = z
  .object({
    projectId: z.string(),
    dashboardId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectDashboardLink' });

assertTypesEqual<ProjectDashboardLink, z.infer<typeof zProjectDashboardLink>>({
  value: true
});
