import { z } from 'zod';

export let zFilterBricksDictionary = z
  .record(z.string(), z.array(z.string()))
  .meta({ id: 'FilterBricksDictionary' });

export type FilterBricksDictionary = z.infer<typeof zFilterBricksDictionary>;
