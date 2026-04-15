import { z } from 'zod';

export let zFileStoreFieldGroup = z
  .object({
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreFieldGroup' });

export type FileStoreFieldGroup = z.infer<typeof zFileStoreFieldGroup>;
