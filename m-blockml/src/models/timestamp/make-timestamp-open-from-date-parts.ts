import { api } from '../../barrels/api';

export function makeTimestampOpenFromDateParts(item: {
  connection: api.ProjectConnection;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}) {
  let { connection, year, month, day, hour, minute } = item;

  // 2016
  // 2016/10
  // 2016/10/05
  // 2016/10/05 21
  // 2016/10/05 21:07

  let sql;

  switch (connection.type) {
    case api.ConnectionTypeEnum.BigQuery: {
      sql = minute
        ? `TIMESTAMP('${year}-${month}-${day} ${hour}:${minute}:00')`
        : hour
        ? `TIMESTAMP('${year}-${month}-${day} ${hour}:00:00')`
        : day
        ? `TIMESTAMP('${year}-${month}-${day}')`
        : month
        ? `TIMESTAMP('${year}-${month}-01')`
        : year
        ? `TIMESTAMP('${year}-01-01')`
        : undefined;
      break;
    }

    case api.ConnectionTypeEnum.PostgreSQL: {
      sql = minute
        ? `'${year}-${month}-${day} ${hour}:${minute}:00'::TIMESTAMP`
        : hour
        ? `'${year}-${month}-${day} ${hour}:00:00'::TIMESTAMP`
        : day
        ? `'${year}-${month}-${day}'::TIMESTAMP`
        : month
        ? `'${year}-${month}-01'::TIMESTAMP`
        : year
        ? `'${year}-01-01'::TIMESTAMP`
        : undefined;
      break;
    }
  }

  return sql;
}
