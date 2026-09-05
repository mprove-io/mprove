import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteProjectResponsePayload = {
  orgId: string;
  deletedProjectId: string;
};

export let zToDiskDeleteProjectResponsePayload = z
  .object({
    orgId: z.string(),
    deletedProjectId: z.string()
  })
  .meta({ id: 'ToDiskDeleteProjectResponsePayload' });

assertTypesEqual<
  ToDiskDeleteProjectResponsePayload,
  z.infer<typeof zToDiskDeleteProjectResponsePayload>
>({ value: true });
