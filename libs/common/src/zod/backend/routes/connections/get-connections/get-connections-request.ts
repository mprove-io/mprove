import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionsInput = {
  projectId: string;
  envId?: string;
};

export type ToBackendGetConnectionsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetConnectionsInput;
};

export let zToBackendGetConnectionsInput = z
  .object({
    projectId: z.string(),
    envId: z.string().nullish()
  })
  .meta({ id: 'ToBackendGetConnectionsInput' });

export let zToBackendGetConnectionsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetConnectionsInput
  })
  .meta({ id: 'ToBackendGetConnectionsRequest' });

assertTypesEqual<
  ToBackendGetConnectionsInput,
  z.infer<typeof zToBackendGetConnectionsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionsRequest,
  z.infer<typeof zToBackendGetConnectionsRequest>
>({ value: true });
