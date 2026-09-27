import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionsListInput = {
  projectId: string;
  envId: string;
};

export type ToBackendGetConnectionsListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetConnectionsListInput;
};

export let zToBackendGetConnectionsListInput = z
  .object({
    projectId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendGetConnectionsListInput' });

export let zToBackendGetConnectionsListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetConnectionsListInput
  })
  .meta({ id: 'ToBackendGetConnectionsListRequest' });

assertTypesEqual<
  ToBackendGetConnectionsListInput,
  z.infer<typeof zToBackendGetConnectionsListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionsListRequest,
  z.infer<typeof zToBackendGetConnectionsListRequest>
>({ value: true });
