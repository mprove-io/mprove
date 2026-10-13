import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendPromptFailedError = {
  code: 'BACKEND_PROMPT_FAILED';
  customData?: {
    status: number;
    body?: unknown;
  };
};

export let zBackendPromptFailedError = z.object({
  code: z.literal('BACKEND_PROMPT_FAILED'),
  customData: z
    .object({
      status: z.number(),
      body: z.unknown().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendPromptFailedError,
  z.infer<typeof zBackendPromptFailedError>
>({ value: true });
