import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type Provider,
  zProvider
} from '#common/types/backend/parts/provider/provider';

export type ToBackendCreateLlmModelOutput = {
  provider?: Provider;
};

export let zToBackendCreateLlmModelOutput = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendCreateLlmModelOutput' });

assertTypesEqual<
  ToBackendCreateLlmModelOutput,
  z.infer<typeof zToBackendCreateLlmModelOutput>
>({ value: true });
