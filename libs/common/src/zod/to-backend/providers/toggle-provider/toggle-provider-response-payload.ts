import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendToggleProviderResponsePayload = {
  provider?: Provider;
};

export let zToBackendToggleProviderResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendToggleProviderResponsePayload' });

assertTypesEqual<
  ToBackendToggleProviderResponsePayload,
  z.infer<typeof zToBackendToggleProviderResponsePayload>
>({ value: true });
