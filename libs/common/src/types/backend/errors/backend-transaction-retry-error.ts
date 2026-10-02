import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendTransactionRetryError = {
  code: 'BACKEND_TRANSACTION_RETRY';
};

export let zBackendTransactionRetryError = z.object({
  code: z.literal('BACKEND_TRANSACTION_RETRY')
});

assertTypesEqual<
  BackendTransactionRetryError,
  z.infer<typeof zBackendTransactionRetryError>
>({ value: true });
