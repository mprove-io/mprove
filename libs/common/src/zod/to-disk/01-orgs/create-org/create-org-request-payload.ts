import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCreateOrgRequestPayload = {
  orgId: string;
};

export let zToDiskCreateOrgRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskCreateOrgRequestPayload' });

assertTypesEqual<
  ToDiskCreateOrgRequestPayload,
  z.infer<typeof zToDiskCreateOrgRequestPayload>
>({ value: true });
