import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsOrgExistRequestPayload = {
  orgId: string;
};

export let zToDiskIsOrgExistRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskIsOrgExistRequestPayload' });

assertTypesEqual<
  ToDiskIsOrgExistRequestPayload,
  z.infer<typeof zToDiskIsOrgExistRequestPayload>
>({ value: true });
