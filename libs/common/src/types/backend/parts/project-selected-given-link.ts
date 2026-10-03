import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type SelectedGiven, zSelectedGiven } from './selected-given';

export type ProjectSelectedGivenLink = {
  projectId: string;
  givens: SelectedGiven[];
  navTs?: number;
};

export let zProjectSelectedGivenLink = z
  .object({
    projectId: z.string(),
    givens: z.array(zSelectedGiven),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectSelectedGivenLink' });

assertTypesEqual<
  ProjectSelectedGivenLink,
  z.infer<typeof zProjectSelectedGivenLink>
>({ value: true });
