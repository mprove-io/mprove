import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OptionsMotherduck = {
  motherduckToken?: string;
  database?: string;
  attachModeSingle?: boolean;
  accessModeReadOnly?: boolean;
};

export let zOptionsMotherduck = z
  .object({
    motherduckToken: z.string().nullish(),
    database: z.string().nullish(),
    attachModeSingle: z.boolean().nullish(),
    accessModeReadOnly: z.boolean().nullish()
  })
  .meta({ id: 'OptionsMotherduck' });

assertTypesEqual<OptionsMotherduck, z.infer<typeof zOptionsMotherduck>>({
  value: true
});
