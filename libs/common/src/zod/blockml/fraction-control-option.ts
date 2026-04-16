import { z } from 'zod';

// TODO: `label` tightened (removed `.nullish()`) to match the
// `FractionControlOption` interface's required TS field so zod-typed fraction
// controls flow into node-common helpers without extra `as any` casts.
// Revisit once node-common migrates to zod types.
export let zFractionControlOption = z
  .object({
    value: z.string(),
    label: z.string()
  })
  .meta({ id: 'FractionControlOption' });

export type FractionControlOption = z.infer<typeof zFractionControlOption>;
