import { common } from '~blockml/barrels/common';

export function makeTimeframeQuarterOfYear(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `CONCAT(CAST('Q' AS STRING), CAST(EXTRACT(QUARTER FROM ${sqlTimestamp}) AS STRING))`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `CAST('Q' AS VARCHAR) || CAST(EXTRACT(QUARTER FROM ${sqlTimestamp})::integer AS VARCHAR)`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `CONCAT(toString('Q'), toString(toQuarter(${sqlTimestamp})))`;
      break;
    }
  }

  return sql;
}
