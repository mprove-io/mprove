import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendEditLlmModelOutput = {
  provider?: Provider;
};

export let zToBackendEditLlmModelOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditLlmModelOutput' });

assertTypesEqual<
  ToBackendEditLlmModelOutput,
  z.infer<typeof zToBackendEditLlmModelOutput>
>({ value: true });
