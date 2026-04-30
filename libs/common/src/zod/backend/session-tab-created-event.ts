import { z } from 'zod';

export let zSessionTabCreatedEventProperties = z
  .object({
    tabId: z.string(),
    chartId: z.string(),
    title: z.string(),
    modelId: z.string()
  })
  .meta({ id: 'SessionTabCreatedEventProperties' });

export type SessionTabCreatedEventProperties = z.infer<
  typeof zSessionTabCreatedEventProperties
>;
