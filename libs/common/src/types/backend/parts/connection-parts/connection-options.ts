import { z } from 'zod';
import { zOptionsBigquery } from '#common/types/backend/parts/connection-parts/options-bigquery';
import { zOptionsDatabricks } from '#common/types/backend/parts/connection-parts/options-databricks';
import { zOptionsMotherduck } from '#common/types/backend/parts/connection-parts/options-motherduck';
import { zOptionsMysql } from '#common/types/backend/parts/connection-parts/options-mysql';
import { zOptionsPostgres } from '#common/types/backend/parts/connection-parts/options-postgres';
import { zOptionsPresto } from '#common/types/backend/parts/connection-parts/options-presto';
import { zOptionsSnowflake } from '#common/types/backend/parts/connection-parts/options-snowflake';
import { zOptionsStoreApi } from '#common/types/backend/parts/connection-parts/options-store-api';
import { zOptionsStoreGoogleApi } from '#common/types/backend/parts/connection-parts/options-store-google-api';
import { zOptionsTrino } from '#common/types/backend/parts/connection-parts/options-trino';

export let zConnectionOptions = z
  .object({
    bigquery: zOptionsBigquery.nullish(),
    databricks: zOptionsDatabricks.nullish(),
    // clickhouse: zOptionsClickhouse.nullish(),
    motherduck: zOptionsMotherduck.nullish(),
    postgres: zOptionsPostgres.nullish(),
    snowflake: zOptionsSnowflake.nullish(),
    mysql: zOptionsMysql.nullish(),
    trino: zOptionsTrino.nullish(),
    presto: zOptionsPresto.nullish(),
    storeApi: zOptionsStoreApi.nullish(),
    storeGoogleApi: zOptionsStoreGoogleApi.nullish()
  })
  .meta({ id: 'ConnectionOptions' });

export type ConnectionOptions = z.infer<typeof zConnectionOptions>;
