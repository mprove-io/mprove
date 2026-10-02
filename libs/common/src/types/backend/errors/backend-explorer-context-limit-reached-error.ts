import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendExplorerContextLimitReachedError = {
  code: 'BACKEND_EXPLORER_CONTEXT_LIMIT_REACHED';
};

export let zBackendExplorerContextLimitReachedError = z.object({
  code: z.literal('BACKEND_EXPLORER_CONTEXT_LIMIT_REACHED')
});

assertTypesEqual<
  BackendExplorerContextLimitReachedError,
  z.infer<typeof zBackendExplorerContextLimitReachedError>
>({ value: true });
