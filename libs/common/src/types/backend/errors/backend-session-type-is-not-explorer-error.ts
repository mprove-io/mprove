import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionTypeIsNotExplorerError = {
  code: 'BACKEND_SESSION_TYPE_IS_NOT_EXPLORER';
};

export let zBackendSessionTypeIsNotExplorerError = z.object({
  code: z.literal('BACKEND_SESSION_TYPE_IS_NOT_EXPLORER')
});

assertTypesEqual<
  BackendSessionTypeIsNotExplorerError,
  z.infer<typeof zBackendSessionTypeIsNotExplorerError>
>({ value: true });
