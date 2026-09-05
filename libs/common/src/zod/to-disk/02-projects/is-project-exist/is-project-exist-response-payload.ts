import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsProjectExistResponsePayload = {
  orgId: string;
  projectId: string;
  isProjectExist: boolean;
};

export let zToDiskIsProjectExistResponsePayload = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    isProjectExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsProjectExistResponsePayload' });

assertTypesEqual<
  ToDiskIsProjectExistResponsePayload,
  z.infer<typeof zToDiskIsProjectExistResponsePayload>
>({ value: true });
