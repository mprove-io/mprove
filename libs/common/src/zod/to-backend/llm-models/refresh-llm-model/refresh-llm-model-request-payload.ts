import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendRefreshLlmModelRequestPayload = {
  projectId: string;
  providerId: string;
  modelId: string;
};

export let zToBackendRefreshLlmModelRequestPayload = z
  .strictObject({
    projectId: z.string(),
    providerId: z.string(),
    modelId: z.string().trim().min(1)
  })
  .meta({ id: 'ToBackendRefreshLlmModelRequestPayload' });

assertTypesEqual<
  ToBackendRefreshLlmModelRequestPayload,
  z.infer<typeof zToBackendRefreshLlmModelRequestPayload>
>({ value: true });
