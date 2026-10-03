import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OptionsBigquery,
  zOptionsBigquery
} from '#common/types/backend/parts/connection-parts/options-bigquery';
import {
  type OptionsDatabricks,
  zOptionsDatabricks
} from '#common/types/backend/parts/connection-parts/options-databricks';
import {
  type OptionsMotherduck,
  zOptionsMotherduck
} from '#common/types/backend/parts/connection-parts/options-motherduck';
import {
  type OptionsMysql,
  zOptionsMysql
} from '#common/types/backend/parts/connection-parts/options-mysql';
import {
  type OptionsPostgres,
  zOptionsPostgres
} from '#common/types/backend/parts/connection-parts/options-postgres';
import {
  type OptionsPresto,
  zOptionsPresto
} from '#common/types/backend/parts/connection-parts/options-presto';
import {
  type OptionsSnowflake,
  zOptionsSnowflake
} from '#common/types/backend/parts/connection-parts/options-snowflake';
import {
  type OptionsStoreApi,
  zOptionsStoreApi
} from '#common/types/backend/parts/connection-parts/options-store-api';
import {
  type OptionsStoreGoogleApi,
  zOptionsStoreGoogleApi
} from '#common/types/backend/parts/connection-parts/options-store-google-api';
import {
  type OptionsTrino,
  zOptionsTrino
} from '#common/types/backend/parts/connection-parts/options-trino';

export type ConnectionOptions = {
  bigquery?: OptionsBigquery;
  databricks?: OptionsDatabricks;
  motherduck?: OptionsMotherduck;
  postgres?: OptionsPostgres;
  snowflake?: OptionsSnowflake;
  mysql?: OptionsMysql;
  trino?: OptionsTrino;
  presto?: OptionsPresto;
  storeApi?: OptionsStoreApi;
  storeGoogleApi?: OptionsStoreGoogleApi;
};

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

assertTypesEqual<ConnectionOptions, z.infer<typeof zConnectionOptions>>({
  value: true
});
