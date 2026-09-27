import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetEnvsInput = {
  projectId: string;
};

export type ToBackendGetEnvsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetEnvsInput;
};

export let zToBackendGetEnvsInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetEnvsInput' });

export let zToBackendGetEnvsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetEnvsInput
  })
  .meta({ id: 'ToBackendGetEnvsRequest' });

assertTypesEqual<ToBackendGetEnvsInput, z.infer<typeof zToBackendGetEnvsInput>>(
  { value: true }
);

assertTypesEqual<
  ToBackendGetEnvsRequest,
  z.infer<typeof zToBackendGetEnvsRequest>
>({ value: true });
