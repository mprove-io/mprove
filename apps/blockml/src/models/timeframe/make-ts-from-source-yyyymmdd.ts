import { common } from '~blockml/barrels/common';

export function makeTsFromSourceYYYYMMDD(item: {
  sql: string;
  connection: common.ProjectConnection;
}) {
  let { sql, connection } = item;

  let ts;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      ts = `PARSE_TIMESTAMP('%Y%m%d', CAST(${sql} AS STRING))`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      ts = `TO_DATE(${sql}::VARCHAR, 'YYYYMMDD')::TIMESTAMP`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      ts = `CAST(parseDateTimeBestEffort(${sql}) as TIMESTAMP)`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      ts = `CAST(TO_DATE((${sql})::VARCHAR, 'YYYYMMDD') as TIMESTAMP_NTZ)`;
      break;
    }
  }

  return ts;
}
