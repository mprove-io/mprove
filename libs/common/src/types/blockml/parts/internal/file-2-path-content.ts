import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type File2PathContent = { path: string; content: string };

export let zFile2PathContent = z
  .object({
    path: z.string(),
    content: z.string()
  })
  .meta({ id: 'File2PathContent' });

assertTypesEqual<File2PathContent, z.infer<typeof zFile2PathContent>>({
  value: true
});
