import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateEnvVarInput = {
  projectId: string;
  envId: string;
  evId: string;
  val: string;
};

export type ToBackendCreateEnvVarRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateEnvVarInput;
};

export let zToBackendCreateEnvVarInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evId: z.string(),
    val: z.string()
  })
  .meta({ id: 'ToBackendCreateEnvVarInput' });

export let zToBackendCreateEnvVarRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateEnvVarInput
  })
  .meta({ id: 'ToBackendCreateEnvVarRequest' });

assertTypesEqual<
  ToBackendCreateEnvVarInput,
  z.infer<typeof zToBackendCreateEnvVarInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEnvVarRequest,
  z.infer<typeof zToBackendCreateEnvVarRequest>
>({ value: true });
