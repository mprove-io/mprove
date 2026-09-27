import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditEnvVarInput = {
  projectId: string;
  envId: string;
  evId: string;
  val: string;
};

export type ToBackendEditEnvVarRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditEnvVarInput;
};

export let zToBackendEditEnvVarInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evId: z.string(),
    val: z.string()
  })
  .meta({ id: 'ToBackendEditEnvVarInput' });

export let zToBackendEditEnvVarRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditEnvVarInput
  })
  .meta({ id: 'ToBackendEditEnvVarRequest' });

assertTypesEqual<
  ToBackendEditEnvVarInput,
  z.infer<typeof zToBackendEditEnvVarInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditEnvVarRequest,
  z.infer<typeof zToBackendEditEnvVarRequest>
>({ value: true });
