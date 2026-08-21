import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendToggleProviderRequestPayload = {
  projectId: string;
  providerId: string;
  isEnabled: boolean;
};

export let zToBackendToggleProviderRequestPayload = z
  .object({
    projectId: z.string(),
    providerId: z.string(),
    isEnabled: z.boolean()
  })
  .meta({ id: 'ToBackendToggleProviderRequestPayload' });

assertTypesEqual<
  ToBackendToggleProviderRequestPayload,
  z.infer<typeof zToBackendToggleProviderRequestPayload>
>({ value: true });
