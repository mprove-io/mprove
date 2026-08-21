import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Provider, zProvider } from '#common/zod/backend/provider';

export type ToBackendRefreshLlmModelResponsePayload = {
  provider?: Provider;
};

export let zToBackendRefreshLlmModelResponsePayload = z
  .strictObject({ provider: zProvider })
  .meta({ id: 'ToBackendRefreshLlmModelResponsePayload' });

assertTypesEqual<
  ToBackendRefreshLlmModelResponsePayload,
  z.infer<typeof zToBackendRefreshLlmModelResponsePayload>
>({ value: true });
