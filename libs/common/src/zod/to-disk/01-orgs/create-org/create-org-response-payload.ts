import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCreateOrgResponsePayload = {
  orgId: string;
};

export let zToDiskCreateOrgResponsePayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskCreateOrgResponsePayload' });

assertTypesEqual<
  ToDiskCreateOrgResponsePayload,
  z.infer<typeof zToDiskCreateOrgResponsePayload>
>({ value: true });
