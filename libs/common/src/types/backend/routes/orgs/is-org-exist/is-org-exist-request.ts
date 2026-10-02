import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsOrgExistRequest = {
  operation: 'isOrgExist';
  traceId: string;
  idempotencyKey: string;
  input: {
    name: string;
  };
};

export let zToBackendIsOrgExistRequest = z
  .strictObject({
    operation: z.literal('isOrgExist'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        name: z.string()
      })
      .meta({ id: 'ToBackendIsOrgExistInput' })
  })
  .meta({ id: 'ToBackendIsOrgExistRequest' });

assertTypesEqual<
  ToBackendIsOrgExistRequest,
  z.infer<typeof zToBackendIsOrgExistRequest>
>({ value: true });
