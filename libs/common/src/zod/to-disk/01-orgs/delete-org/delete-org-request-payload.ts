import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteOrgRequestPayload = {
  orgId: string;
};

export let zToDiskDeleteOrgRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskDeleteOrgRequestPayload' });

assertTypesEqual<
  ToDiskDeleteOrgRequestPayload,
  z.infer<typeof zToDiskDeleteOrgRequestPayload>
>({ value: true });
