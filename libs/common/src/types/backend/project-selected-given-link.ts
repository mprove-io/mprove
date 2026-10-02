import { z } from 'zod';
import { zSelectedGiven } from './selected-given';

export let zProjectSelectedGivenLink = z
  .object({
    projectId: z.string(),
    givens: z.array(zSelectedGiven),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectSelectedGivenLink' });

export type ProjectSelectedGivenLink = z.infer<
  typeof zProjectSelectedGivenLink
>;
