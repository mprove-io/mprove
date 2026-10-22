import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type TxWriteError,
  zTxWriteError
} from '#common/types/backend/function-errors/tx-write-error';

export type WriteError = TxWriteError;

export let zWriteError = zTxWriteError;

assertTypesEqual<WriteError, z.infer<typeof zWriteError>>({
  value: true
});
