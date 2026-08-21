import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendEditLlmModelResponsePayload = {
  provider?: Provider;
};

export let zToBackendEditLlmModelResponsePayload = z
  .object({ provider: zProvider })
  .meta({ id: 'ToBackendEditLlmModelResponsePayload' });

assertTypesEqual<
  ToBackendEditLlmModelResponsePayload,
  z.infer<typeof zToBackendEditLlmModelResponsePayload>
>({ value: true });
