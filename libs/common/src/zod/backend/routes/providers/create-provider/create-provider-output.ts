import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendCreateProviderOutput = {
  provider?: Provider;
};

export let zToBackendCreateProviderOutput = z
  .object({
    provider: zProvider
  })
  .meta({ id: 'ToBackendCreateProviderOutput' });

assertTypesEqual<
  ToBackendCreateProviderOutput,
  z.infer<typeof zToBackendCreateProviderOutput>
>({ value: true });
