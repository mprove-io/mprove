import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FractionControlOption = { value: string; label?: string };

export let zFractionControlOption = z
  .object({
    value: z.string(),
    label: z.string().nullish()
  })
  .meta({ id: 'FractionControlOption' });

assertTypesEqual<FractionControlOption, z.infer<typeof zFractionControlOption>>(
  { value: true }
);
