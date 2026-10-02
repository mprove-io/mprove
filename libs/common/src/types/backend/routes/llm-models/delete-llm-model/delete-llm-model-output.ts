import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Provider, zProvider } from '#common/types/backend/provider';

export type ToBackendDeleteLlmModelOutput = {
  provider?: Provider;
};

export let zToBackendDeleteLlmModelOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendDeleteLlmModelOutput' });

assertTypesEqual<
  ToBackendDeleteLlmModelOutput,
  z.infer<typeof zToBackendDeleteLlmModelOutput>
>({ value: true });
