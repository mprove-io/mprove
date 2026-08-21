import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendGetLlmModelPartsRequestPayload = {
  projectId: string;
  providerId: string;
};

export let zToBackendGetLlmModelPartsRequestPayload = z
  .strictObject({
    projectId: z.string(),
    providerId: z.string().trim().min(1)
  })
  .meta({ id: 'ToBackendGetLlmModelPartsRequestPayload' });

assertTypesEqual<
  ToBackendGetLlmModelPartsRequestPayload,
  z.infer<typeof zToBackendGetLlmModelPartsRequestPayload>
>({ value: true });
