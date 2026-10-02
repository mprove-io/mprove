import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetGivensRequest = {
  operation: 'getGivens';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetGivensRequest = z
  .strictObject({
    operation: z.literal('getGivens'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetGivensInput' })
  })
  .meta({ id: 'ToBackendGetGivensRequest' });

assertTypesEqual<
  ToBackendGetGivensRequest,
  z.infer<typeof zToBackendGetGivensRequest>
>({ value: true });
