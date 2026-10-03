import type { TagInterface } from '@malloydata/malloy-tag';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type KeyTagPair = { key: string; tagInterface?: TagInterface };

export let zKeyTagPair = z
  .object({
    key: z.string(),
    tagInterface: z.custom<TagInterface>().nullish()
  })
  .meta({ id: 'KeyTagPair' });

assertTypesEqual<KeyTagPair, z.infer<typeof zKeyTagPair>>({ value: true });
