import { api } from '~/barrels/api';

export function makeTimeframeMonthName(item: {
  sqlTimestamp: string;
  connection: api.ProjectConnection;
}) {
  let { sqlTimestamp, connection } = item;

  let sql: string;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
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

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = `TO_CHAR(${sqlTimestamp}, 'FMMonth')`;
      break;
    }
  }

  return sql;
}
