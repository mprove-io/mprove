import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class BigQueryService {
  constructor(private connection: Connection) {}

  async runQuery(item: {
    userId: string;
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, userId, connection } = item;

    let bigquery = new BigQuery({
      credentials: connection.bigquery_credentials,
      projectId: connection.bigquery_project
    });

    query.last_run_by = userId;
    query.last_run_ts = helper.makeTs();
    query.bigquery_query_job_id = null;

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: false,
        useLegacySql: false,
        query: query.sql
      })
      .catch(e => {
        query.status = common.QueryStatusEnum.Error;
        query.last_error_message = e.message;
        query.last_error_ts = helper.makeTs();
      });

    if (common.isDefined(createQueryJobItem)) {
      let queryJob = createQueryJobItem[0];
      let createQueryJobApiResponse = createQueryJobItem[1];

      query.status = common.QueryStatusEnum.Running;
      query.bigquery_query_job_id = queryJob.id;
    }

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.modifyRecords({
        manager: manager,
        records: {
          queries: [query]
        }
      });
    });

    let recordsQuery = records.queries.find(x => x.query_id === query.query_id);

    return recordsQuery;
  }
}
