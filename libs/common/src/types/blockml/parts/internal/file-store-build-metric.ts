import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileStoreBuildMetric = { time?: string; time_line_num?: number };

export let zFileStoreBuildMetric = z
  .object({
    time: z.string().nullish(),
    time_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreBuildMetric' });

assertTypesEqual<FileStoreBuildMetric, z.infer<typeof zFileStoreBuildMetric>>({
  value: true
});
