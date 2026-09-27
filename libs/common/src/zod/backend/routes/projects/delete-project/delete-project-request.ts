import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteProjectInput = {
  projectId: string;
};

export type ToBackendDeleteProjectRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteProjectInput;
};

export let zToBackendDeleteProjectInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendDeleteProjectInput' });

export let zToBackendDeleteProjectRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteProjectInput
  })
  .meta({ id: 'ToBackendDeleteProjectRequest' });

assertTypesEqual<
  ToBackendDeleteProjectInput,
  z.infer<typeof zToBackendDeleteProjectInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteProjectRequest,
  z.infer<typeof zToBackendDeleteProjectRequest>
>({ value: true });
