import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendDeleteProviderRequestPayload = {
  projectId: string;
  providerId: string;
};

export let zToBackendDeleteProviderRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string()
  })
  .meta({ id: 'ToBackendDeleteProviderRequestPayload' });

assertTypesEqual<
  ToBackendDeleteProviderRequestPayload,
  z.infer<typeof zToBackendDeleteProviderRequestPayload>
>({ value: true });
