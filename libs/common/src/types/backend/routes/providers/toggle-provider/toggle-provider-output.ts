import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/types/backend/provider';

export type ToBackendToggleProviderOutput = {
  provider?: Provider;
};

export let zToBackendToggleProviderOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendToggleProviderOutput' });

assertTypesEqual<
  ToBackendToggleProviderOutput,
  z.infer<typeof zToBackendToggleProviderOutput>
>({ value: true });
