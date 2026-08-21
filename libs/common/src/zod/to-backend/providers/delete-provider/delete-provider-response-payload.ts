import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendDeleteProviderResponsePayload = Record<string, never>;

export let zToBackendDeleteProviderResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteProviderResponsePayload' });

assertTypesEqual<
  ToBackendDeleteProviderResponsePayload,
  z.infer<typeof zToBackendDeleteProviderResponsePayload>
>({ value: true });
