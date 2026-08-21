import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendDeleteLlmModelResponsePayload = {
  provider?: Provider;
};

export let zToBackendDeleteLlmModelResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendDeleteLlmModelResponsePayload' });

assertTypesEqual<
  ToBackendDeleteLlmModelResponsePayload,
  z.infer<typeof zToBackendDeleteLlmModelResponsePayload>
>({ value: true });
