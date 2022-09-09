import { common } from '~blockml/barrels/common';

export function makeTimeframeMonthName(item: {
  sqlTimestamp: string;
  connection: common.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sql = `CASE
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 1 THEN 'January'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 2 THEN 'February'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 3 THEN 'March'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 4 THEN 'April'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 5 THEN 'May'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 6 THEN 'June'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 7 THEN 'July'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 8 THEN 'August'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 9 THEN 'September'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 10 THEN 'October'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 11 THEN 'November'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 12 THEN 'December'
      END`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'FMMonth')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sql = `CASE
      WHEN toMonth(${sqlTimestamp}) = 1 THEN 'January'
      WHEN toMonth(${sqlTimestamp}) = 2 THEN 'February'
      WHEN toMonth(${sqlTimestamp}) = 3 THEN 'March'
      WHEN toMonth(${sqlTimestamp}) = 4 THEN 'April'
      WHEN toMonth(${sqlTimestamp}) = 5 THEN 'May'
      WHEN toMonth(${sqlTimestamp}) = 6 THEN 'June'
      WHEN toMonth(${sqlTimestamp}) = 7 THEN 'July'
      WHEN toMonth(${sqlTimestamp}) = 8 THEN 'August'
      WHEN toMonth(${sqlTimestamp}) = 9 THEN 'September'
      WHEN toMonth(${sqlTimestamp}) = 10 THEN 'October'
      WHEN toMonth(${sqlTimestamp}) = 11 THEN 'November'
      WHEN toMonth(${sqlTimestamp}) = 12 THEN 'December'
      END`;
      break;
    }

    case common.ConnectionTypeEnum.SnowFlake: {
      sql = `CASE
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 1 THEN 'January'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 2 THEN 'February'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 3 THEN 'March'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 4 THEN 'April'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 5 THEN 'May'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 6 THEN 'June'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 7 THEN 'July'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 8 THEN 'August'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 9 THEN 'September'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 10 THEN 'October'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 11 THEN 'November'
      WHEN EXTRACT(MONTH FROM ${sqlTimestamp}) = 12 THEN 'December'
      END`;
      break;
    }
  }

  return sql;
}
