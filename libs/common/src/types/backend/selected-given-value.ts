import { z } from 'zod';

export let zSelectedGivenPrimitive = z.union([z.string(), z.boolean()]);

export let zSelectedGivenValue = z.union([
  zSelectedGivenPrimitive,
  z.array(zSelectedGivenPrimitive)
]);

export type SelectedGivenValue = z.infer<typeof zSelectedGivenValue>;
