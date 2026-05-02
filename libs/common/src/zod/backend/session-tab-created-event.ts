import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export let zSessionTabCreatedEventProperties = z
  .object({
    tabId: z.string(),
    chartId: z.string(),
    chartType: z.enum(ChartTypeEnum),
    title: z.string(),
    modelId: z.string()
  })
  .meta({ id: 'SessionTabCreatedEventProperties' });

export type SessionTabCreatedEventProperties = z.infer<
  typeof zSessionTabCreatedEventProperties
>;
