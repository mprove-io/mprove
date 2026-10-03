import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectModelLink = {
  projectId: string;
  modelId: string;
  navTs?: number;
};

export let zProjectModelLink = z
  .object({
    projectId: z.string(),
    modelId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectModelLink' });

assertTypesEqual<ProjectModelLink, z.infer<typeof zProjectModelLink>>({
  value: true
});
