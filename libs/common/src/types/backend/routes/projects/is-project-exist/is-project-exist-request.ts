import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendIsProjectExistRequest = {
  operation: 'isProjectExist';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
    name: string;
  };
};

export let zToBackendIsProjectExistRequest = z
  .strictObject({
    operation: z.literal('isProjectExist'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string(),
        name: z.string()
      })
      .meta({ id: 'ToBackendIsProjectExistInput' })
  })
  .meta({ id: 'ToBackendIsProjectExistRequest' });

assertTypesEqual<
  ToBackendIsProjectExistRequest,
  z.infer<typeof zToBackendIsProjectExistRequest>
>({ value: true });
