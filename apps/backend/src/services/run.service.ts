import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { PgService } from './pg.service';

@Injectable()
export class RunService {
  constructor(private pgService: PgService) {}

  async runQuery(item: {
    userId: string;
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, connection, userId } = item;

    let rQuery: entities.QueryEntity;

    if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
      rQuery = await this.pgService.runQuery({
        userId,
        query,
        connection
      });
    }

    return rQuery;
  }
}
