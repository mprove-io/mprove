import { z } from 'zod';

export let zFileStoreBuildMetric = z
  .object({
    time: z.string().nullish(),
    time_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreBuildMetric' });

export type FileStoreBuildMetric = z.infer<typeof zFileStoreBuildMetric>;
