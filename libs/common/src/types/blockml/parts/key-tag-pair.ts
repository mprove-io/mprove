import type { TagInterface } from '@malloydata/malloy-tag';
import { z } from 'zod';

export let zKeyTagPair = z
  .object({
    key: z.string(),
    tagInterface: z.custom<TagInterface>().nullish()
  })
  .meta({ id: 'KeyTagPair' });

export type KeyTagPair = z.infer<typeof zKeyTagPair>;
