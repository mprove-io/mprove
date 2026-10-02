import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMessageAgentRequiredError = {
  code: 'BACKEND_MESSAGE_AGENT_REQUIRED';
};

export let zBackendMessageAgentRequiredError = z.object({
  code: z.literal('BACKEND_MESSAGE_AGENT_REQUIRED')
});

assertTypesEqual<
  BackendMessageAgentRequiredError,
  z.infer<typeof zBackendMessageAgentRequiredError>
>({ value: true });
