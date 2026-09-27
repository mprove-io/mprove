import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGenerateProjectRemoteKeyInput = {
  orgId: string;
};

export type ToBackendGenerateProjectRemoteKeyRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGenerateProjectRemoteKeyInput;
};

export let zToBackendGenerateProjectRemoteKeyInput = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyInput' });

export let zToBackendGenerateProjectRemoteKeyRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGenerateProjectRemoteKeyInput
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyRequest' });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyInput,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyInput>
>({ value: true });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyRequest,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyRequest>
>({ value: true });
