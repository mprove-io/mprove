import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendCreateLlmModelResponsePayload = {
  provider?: Provider;
};

export let zToBackendCreateLlmModelResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendCreateLlmModelResponsePayload' });

assertTypesEqual<
  ToBackendCreateLlmModelResponsePayload,
  z.infer<typeof zToBackendCreateLlmModelResponsePayload>
>({ value: true });
