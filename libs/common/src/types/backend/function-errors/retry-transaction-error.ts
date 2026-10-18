import type { CustomRetryError } from '#common/types/backend/function-errors/custom-retry-error';

export type RetryTransactionError<Failure> = CustomRetryError<Failure>;
