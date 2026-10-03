import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileStoreFieldGroup = {
  group?: string;
  group_line_num?: number;
  label?: string;
  label_line_num?: number;
};

export let zFileStoreFieldGroup = z
  .object({
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreFieldGroup' });

assertTypesEqual<FileStoreFieldGroup, z.infer<typeof zFileStoreFieldGroup>>({
  value: true
});
