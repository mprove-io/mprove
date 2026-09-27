import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskIsProjectExistOutput = {
  orgId: string;
  projectId: string;
  isProjectExist: boolean;
};

export let zToDiskIsProjectExistOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    isProjectExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsProjectExistOutput' });

assertTypesEqual<
  ToDiskIsProjectExistOutput,
  z.infer<typeof zToDiskIsProjectExistOutput>
>({ value: true });
