import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteOrgResponsePayload = {
  deletedOrgId: string;
};

export let zToDiskDeleteOrgResponsePayload = z
  .object({
    deletedOrgId: z.string()
  })
  .meta({ id: 'ToDiskDeleteOrgResponsePayload' });

assertTypesEqual<
  ToDiskDeleteOrgResponsePayload,
  z.infer<typeof zToDiskDeleteOrgResponsePayload>
>({ value: true });
