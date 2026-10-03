import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileStoreFieldTimeGroup = {
  time?: string;
  time_line_num?: number;
  group?: string;
  group_line_num?: number;
  label?: string;
  label_line_num?: number;
};

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

assertTypesEqual<
  FileStoreFieldTimeGroup,
  z.infer<typeof zFileStoreFieldTimeGroup>
>({ value: true });
