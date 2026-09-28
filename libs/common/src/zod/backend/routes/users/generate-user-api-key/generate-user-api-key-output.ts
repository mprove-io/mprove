import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGenerateUserApiKeyOutput = {
  apiKey: string;
  apiKeyPrefix: string;
};

export let zToBackendGenerateUserApiKeyOutput = z
  .object({
    apiKey: z.string(),
    apiKeyPrefix: z.string()
  })
  .meta({ id: 'ToBackendGenerateUserApiKeyOutput' });

assertTypesEqual<
  ToBackendGenerateUserApiKeyOutput,
  z.infer<typeof zToBackendGenerateUserApiKeyOutput>
>({ value: true });
