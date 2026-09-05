import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteProjectRequestPayload = {
  orgId: string;
  projectId: string;
};

export let zToDiskDeleteProjectRequestPayload = z
  .object({
    orgId: z.string(),
    projectId: z.string()
  })
  .meta({ id: 'ToDiskDeleteProjectRequestPayload' });

assertTypesEqual<
  ToDiskDeleteProjectRequestPayload,
  z.infer<typeof zToDiskDeleteProjectRequestPayload>
>({ value: true });
