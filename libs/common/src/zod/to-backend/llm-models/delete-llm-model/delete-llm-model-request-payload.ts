import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendDeleteLlmModelRequestPayload = {
  projectId: string;
  providerId: string;
  modelId: string;
};

export let zToBackendDeleteLlmModelRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1)
  })
  .meta({ id: 'ToBackendDeleteLlmModelRequestPayload' });

assertTypesEqual<
  ToBackendDeleteLlmModelRequestPayload,
  z.infer<typeof zToBackendDeleteLlmModelRequestPayload>
>({ value: true });
