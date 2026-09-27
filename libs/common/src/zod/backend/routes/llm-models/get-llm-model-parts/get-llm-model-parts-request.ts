import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetLlmModelPartsInput = {
  projectId: string;
  providerId: string;
};

export type ToBackendGetLlmModelPartsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetLlmModelPartsInput;
};

export let zToBackendGetLlmModelPartsInput = z
  .strictObject({
    projectId: z.string(),
    providerId: z.string().trim().min(1)
  })
  .meta({ id: 'ToBackendGetLlmModelPartsInput' });

export let zToBackendGetLlmModelPartsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetLlmModelPartsInput
  })
  .meta({ id: 'ToBackendGetLlmModelPartsRequest' });

assertTypesEqual<
  ToBackendGetLlmModelPartsInput,
  z.infer<typeof zToBackendGetLlmModelPartsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetLlmModelPartsRequest,
  z.infer<typeof zToBackendGetLlmModelPartsRequest>
>({ value: true });
