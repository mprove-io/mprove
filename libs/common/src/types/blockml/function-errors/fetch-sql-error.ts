import type { AsyncPoolError } from '#common/types/backend/function-errors/async-pool-error';
import type { FetchTileSqlError } from '#common/types/blockml/function-errors/fetch-tile-sql-error';

export type FetchSqlError = AsyncPoolError<FetchTileSqlError>;
