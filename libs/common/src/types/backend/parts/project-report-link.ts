import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectReportLink = {
  projectId: string;
  reportId: string;
  navTs?: number;
};

export let zProjectReportLink = z
  .object({
    projectId: z.string(),
    reportId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectReportLink' });

assertTypesEqual<ProjectReportLink, z.infer<typeof zProjectReportLink>>({
  value: true
});
