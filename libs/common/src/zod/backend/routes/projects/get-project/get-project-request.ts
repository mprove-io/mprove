import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProjectInput = {
  projectId: string;
};

export type ToBackendGetProjectRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetProjectInput;
};

export let zToBackendGetProjectInput = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetProjectInput' });

export let zToBackendGetProjectRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetProjectInput
  })
  .meta({ id: 'ToBackendGetProjectRequest' });

assertTypesEqual<
  ToBackendGetProjectInput,
  z.infer<typeof zToBackendGetProjectInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetProjectRequest,
  z.infer<typeof zToBackendGetProjectRequest>
>({ value: true });
