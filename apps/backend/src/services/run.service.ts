import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { BigQueryService } from './bigquery.service';
import { ClickHouseService } from './clickhouse.service';
import { PgService } from './pg.service';

@Injectable()
export class RunService {
  constructor(
    private pgService: PgService,
    private clickhouseService: ClickHouseService,
    private bigqueryService: BigQueryService
  ) {}

  async runQuery(item: {
    userId: string;
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, connection, userId } = item;

    let recordsQuery: entities.QueryEntity;

    if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
      recordsQuery = await this.pgService.runQuery({
        userId,
        query,
        connection
      });
    } else if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
      recordsQuery = await this.clickhouseService.runQuery({
        userId,
        query,
        connection
      });
    } else if (connection.type === common.ConnectionTypeEnum.BigQuery) {
      recordsQuery = await this.bigqueryService.runQuery({
        userId,
        query,
        connection
      });
    }

    return recordsQuery;
  }
}
