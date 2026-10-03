import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectChartLink = {
  projectId: string;
  chartId: string;
  navTs?: number;
};

export let zProjectChartLink = z
  .object({
    projectId: z.string(),
    chartId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectChartLink' });

assertTypesEqual<ProjectChartLink, z.infer<typeof zProjectChartLink>>({
  value: true
});
