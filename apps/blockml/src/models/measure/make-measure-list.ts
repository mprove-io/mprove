import { common } from '~blockml/barrels/common';

export function makeMeasureList(item: {
  sqlFinal: string;
  connection: common.ProjectConnection;
}) {
  let { connection, sqlFinal } = item;

  let sqlSelect;

  switch (connection.type) {
    case common.ConnectionTypeEnum.BigQuery: {
      sqlSelect = `STRING_AGG(DISTINCT CAST(${sqlFinal} AS STRING), ', ')`;
      break;
    }

    case common.ConnectionTypeEnum.PostgreSQL: {
      sqlSelect = `STRING_AGG(DISTINCT CAST(${sqlFinal} AS TEXT), ', ')`;
      break;
    }

    case common.ConnectionTypeEnum.ClickHouse: {
      sqlSelect = `arrayStringConcat(arrayDistinct(groupArray(toString(${sqlFinal}))), ', ')`;
      break;
    }
  }

  return sqlSelect;
}
