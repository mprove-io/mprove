import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendEditProviderResponsePayload = {
  provider?: Provider;
};

export let zToBackendEditProviderResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditProviderResponsePayload' });

assertTypesEqual<
  ToBackendEditProviderResponsePayload,
  z.infer<typeof zToBackendEditProviderResponsePayload>
>({ value: true });
