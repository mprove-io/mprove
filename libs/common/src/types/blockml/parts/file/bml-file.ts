import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BmlFile = {
  name: string;
  path: string;
  pathRelativeToRepo?: string;
  blockmlPath?: string;
  content: string;
};

export let zBmlFile = z
  .object({
    name: z.string(),
    path: z.string(),
    pathRelativeToRepo: z.string().nullish(),
    blockmlPath: z.string().nullish(),
    content: z.string()
  })
  .meta({ id: 'BmlFile' });

assertTypesEqual<BmlFile, z.infer<typeof zBmlFile>>({ value: true });
