import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ProjectSt = {
  name: string;
  e2bApiKey?: string;
};

export let zProjectSt = z
  .object({
    name: z.string(),
    e2bApiKey: z.string().nullish()
  })
  .meta({ id: 'ProjectSt' });

assertTypesEqual<ProjectSt, z.infer<typeof zProjectSt>>({ value: true });
