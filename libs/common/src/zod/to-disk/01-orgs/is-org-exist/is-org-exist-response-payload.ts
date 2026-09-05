import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsOrgExistResponsePayload = {
  orgId: string;
  isOrgExist: boolean;
};

export let zToDiskIsOrgExistResponsePayload = z
  .object({
    orgId: z.string(),
    isOrgExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsOrgExistResponsePayload' });

assertTypesEqual<
  ToDiskIsOrgExistResponsePayload,
  z.infer<typeof zToDiskIsOrgExistResponsePayload>
>({ value: true });
