import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { CustomRetryError } from '#common/types/backend/function-errors/custom-retry-error';
import type { TransactionError } from '#common/types/backend/function-errors/transaction-error';
import {
  type TxWriteError,
  zTxWriteError
} from '#common/types/backend/function-errors/tx-write-error';

export type WriteError = CustomRetryError<TransactionError<TxWriteError>>;

export let zWriteError = zTxWriteError;

assertTypesEqual<WriteError, z.infer<typeof zWriteError>>({
  value: true
});
