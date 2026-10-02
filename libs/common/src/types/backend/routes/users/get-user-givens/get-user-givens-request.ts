import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetUserGivensRequest = {
  operation: 'getUserGivens';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
  };
};

export let zToBackendGetUserGivensRequest = z
  .strictObject({
    operation: z.literal('getUserGivens'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string()
      })
      .meta({ id: 'ToBackendGetUserGivensInput' })
  })
  .meta({ id: 'ToBackendGetUserGivensRequest' });

assertTypesEqual<
  ToBackendGetUserGivensRequest,
  z.infer<typeof zToBackendGetUserGivensRequest>
>({ value: true });
