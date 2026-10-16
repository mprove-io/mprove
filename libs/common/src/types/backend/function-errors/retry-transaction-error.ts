import type { RetryError } from '#common/types/backend/function-errors/retry-error';

export type RetryTransactionError<Failure> = RetryError<Failure>;
