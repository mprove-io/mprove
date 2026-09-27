import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteConnectionInput = {
  projectId: string;
  envId: string;
  connectionId: string;
};

export type ToBackendDeleteConnectionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteConnectionInput;
};

export let zToBackendDeleteConnectionInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string()
  })
  .meta({ id: 'ToBackendDeleteConnectionInput' });

export let zToBackendDeleteConnectionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteConnectionInput
  })
  .meta({ id: 'ToBackendDeleteConnectionRequest' });

assertTypesEqual<
  ToBackendDeleteConnectionInput,
  z.infer<typeof zToBackendDeleteConnectionInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteConnectionRequest,
  z.infer<typeof zToBackendDeleteConnectionRequest>
>({ value: true });
