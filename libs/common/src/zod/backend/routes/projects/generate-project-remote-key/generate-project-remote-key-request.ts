import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGenerateProjectRemoteKeyRequest = {
  operation: 'generateProjectRemoteKey';
  traceId: string;
  idempotencyKey: string;
  input: {
    orgId: string;
  };
};

export let zToBackendGenerateProjectRemoteKeyRequest = z
  .strictObject({
    operation: z.literal('generateProjectRemoteKey'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        orgId: z.string()
      })
      .meta({ id: 'ToBackendGenerateProjectRemoteKeyInput' })
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyRequest' });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyRequest,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyRequest>
>({ value: true });
