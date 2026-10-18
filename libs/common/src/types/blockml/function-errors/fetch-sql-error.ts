import type { CustomAsyncPoolError } from '#common/types/backend/function-errors/custom-async-pool-error';
import type { FetchTileSqlError } from '#common/types/blockml/function-errors/fetch-tile-sql-error';

export type FetchSqlError = CustomAsyncPoolError<FetchTileSqlError>;
