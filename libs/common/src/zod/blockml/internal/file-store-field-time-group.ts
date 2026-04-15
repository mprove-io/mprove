import { z } from 'zod';

export let zFileStoreFieldTimeGroup = z
  .object({
    time: z.string().nullish(),
    time_line_num: z.number().nullish(),
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreFieldTimeGroup' });

export type FileStoreFieldTimeGroup = z.infer<typeof zFileStoreFieldTimeGroup>;
