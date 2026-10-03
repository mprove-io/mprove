import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileErrorLine = { line: number; name: string; path: string };

export let zFileErrorLine = z
  .object({
    line: z.number(),
    name: z.string(),
    path: z.string()
  })
  .meta({ id: 'FileErrorLine' });

assertTypesEqual<FileErrorLine, z.infer<typeof zFileErrorLine>>({
  value: true
});
