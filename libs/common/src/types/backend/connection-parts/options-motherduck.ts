import { z } from 'zod';

export let zOptionsMotherduck = z
  .object({
    motherduckToken: z.string().nullish(),
    database: z.string().nullish(),
    attachModeSingle: z.boolean().nullish(),
    accessModeReadOnly: z.boolean().nullish()
  })
  .meta({ id: 'OptionsMotherduck' });

export type OptionsMotherduck = z.infer<typeof zOptionsMotherduck>;
