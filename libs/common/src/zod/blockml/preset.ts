import { z } from 'zod';

export let zPreset = z
  .object({
    presetId: z.string(),
    label: z.string(),
    path: z.string(),
    parsedContent: z.any()
  })
  .meta({ id: 'Preset' });

export type Preset = z.infer<typeof zPreset>;
