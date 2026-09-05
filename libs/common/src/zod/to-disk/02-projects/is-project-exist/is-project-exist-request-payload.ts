import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsProjectExistRequestPayload = {
  orgId: string;
  projectId: string;
};

export let zToDiskIsProjectExistRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string()
  })
  .meta({ id: 'ToDiskIsProjectExistRequestPayload' });

assertTypesEqual<
  ToDiskIsProjectExistRequestPayload,
  z.infer<typeof zToDiskIsProjectExistRequestPayload>
>({ value: true });
