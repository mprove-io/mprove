import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendCreateProviderResponsePayload = {
  provider?: Provider;
};

export let zToBackendCreateProviderResponsePayload = z
  .object({
    provider: zProvider
  })
  .meta({ id: 'ToBackendCreateProviderResponsePayload' });

assertTypesEqual<
  ToBackendCreateProviderResponsePayload,
  z.infer<typeof zToBackendCreateProviderResponsePayload>
>({ value: true });
