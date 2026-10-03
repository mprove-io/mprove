import type { ConnectionConfigEntry } from '@malloydata/malloy';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MalloyConfigPart = {
  malloyConnectionConfigEntry: ConnectionConfigEntry;
  envs: Record<string, string>;
  files: { path: string; data: string }[];
};

export let zMalloyConfigPart = z
  .object({
    malloyConnectionConfigEntry: z.custom<ConnectionConfigEntry>(),
    envs: z.record(z.string(), z.string()),
    files: z.array(z.object({ path: z.string(), data: z.string() }))
  })
  .meta({ id: 'MalloyConfigPart' });

assertTypesEqual<MalloyConfigPart, z.infer<typeof zMalloyConfigPart>>({
  value: true
});
