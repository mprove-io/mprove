import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/types/backend/provider';

export type ToBackendEditProviderOutput = {
  provider?: Provider;
};

export let zToBackendEditProviderOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditProviderOutput' });

assertTypesEqual<
  ToBackendEditProviderOutput,
  z.infer<typeof zToBackendEditProviderOutput>
>({ value: true });
