import { common } from '~blockml/barrels/common';

export function makeTimestampCurrent(item: {
  connection: common.ProjectConnection;
  timezone: string;
}) {
  let { connection, timezone } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql =
        timezone === common.UTC
          ? 'CURRENT_TIMESTAMP()'
          : `TIMESTAMP(FORMAT_TIMESTAMP('%F %T', CURRENT_TIMESTAMP(), '${timezone}'))`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql =
        timezone === common.UTC
          ? 'CURRENT_TIMESTAMP'
          : `TIMEZONE('${timezone}', CURRENT_TIMESTAMP::TIMESTAMPTZ)`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = timezone === common.UTC ? 'now()' : `now('${timezone}')`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql =
        timezone === common.UTC
          ? 'CAST(CURRENT_TIMESTAMP() AS TIMESTAMP_NTZ)'
          : `CONVERT_TIMEZONE('UTC', '${timezone}',  CAST(CURRENT_TIMESTAMP() AS TIMESTAMP_NTZ))`;
      break;
    }
  }

  return sql;
}
