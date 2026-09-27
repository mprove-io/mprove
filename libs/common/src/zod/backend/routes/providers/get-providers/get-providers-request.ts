import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProvidersInput = {
  projectId: string;
};

export type ToBackendGetProvidersRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetProvidersInput;
};

export let zToBackendGetProvidersInput = z
  .object({ projectId: z.string() })
  .meta({ id: 'ToBackendGetProvidersInput' });

export let zToBackendGetProvidersRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetProvidersInput
  })
  .meta({ id: 'ToBackendGetProvidersRequest' });

assertTypesEqual<
  ToBackendGetProvidersInput,
  z.infer<typeof zToBackendGetProvidersInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetProvidersRequest,
  z.infer<typeof zToBackendGetProvidersRequest>
>({ value: true });
