import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserApiKeyOutput = Record<string, never>;

export let zToBackendDeleteUserApiKeyOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserApiKeyOutput' });

assertTypesEqual<
  ToBackendDeleteUserApiKeyOutput,
  z.infer<typeof zToBackendDeleteUserApiKeyOutput>
>({ value: true });
