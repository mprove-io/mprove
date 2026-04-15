import type { ConnectionConfigEntry } from '@malloydata/malloy';
import { z } from 'zod';

export let zMalloyConfigPart = z
  .object({
    malloyConnectionConfigEntry: z.custom<ConnectionConfigEntry>(),
    envs: z.record(z.string(), z.string()),
    files: z.array(z.object({ path: z.string(), data: z.string() }))
  })
  .meta({ id: 'MalloyConfigPart' });

export type MalloyConfigPart = z.infer<typeof zMalloyConfigPart>;
