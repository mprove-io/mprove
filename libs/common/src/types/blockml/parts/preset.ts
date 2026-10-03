import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type Preset = {
  presetId: string;
  label: string;
  path: string;
  parsedContent: any;
};

export let zPreset = z
  .object({
    presetId: z.string(),
    label: z.string(),
    path: z.string(),
    parsedContent: z.any()
  })
  .meta({ id: 'Preset' });

assertTypesEqual<Preset, z.infer<typeof zPreset>>({ value: true });
