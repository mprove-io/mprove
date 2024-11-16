import { BigQuery } from '@google-cloud/bigquery';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, sql } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';

let retry = require('async-retry');

@Injectable()
export class QueriesService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getQueryCheckExistsSkipData(item: {
    queryId: string;
    projectId: string;
  }) {
    let { queryId: queryId, projectId: projectId } = item;

    let queries = (await this.db.drizzle
      .select({
        projectId: queriesTable.projectId,
        envId: queriesTable.envId,
        connectionId: queriesTable.connectionId,
        connectionType: queriesTable.connectionType,
        queryId: queriesTable.queryId,
        sql: queriesTable.sql,
        status: queriesTable.status,
        // data: ...,
        lastRunBy: queriesTable.lastRunBy,
        lastRunTs: queriesTable.lastRunTs,
        lastCancelTs: queriesTable.lastCancelTs,
        lastCompleteTs: queriesTable.lastCompleteTs,
        lastCompleteDuration: queriesTable.lastCompleteDuration,
        lastErrorMessage: queriesTable.lastErrorMessage,
        lastErrorTs: queriesTable.lastErrorTs,
        queryJobId: queriesTable.queryJobId,
        bigqueryQueryJobId: queriesTable.bigqueryQueryJobId,
        bigqueryConsecutiveErrorsGetJob:
          queriesTable.bigqueryConsecutiveErrorsGetJob,
        bigqueryConsecutiveErrorsGetResults:
          queriesTable.bigqueryConsecutiveErrorsGetResults,
        serverTs: queriesTable.serverTs
      })
      .from(queriesTable)
      .where(
        and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.projectId, projectId)
        )
      )) as schemaPostgres.QueryEnt[];

    let query = queries.length < 0 ? undefined : queries[0];

    // let query = await this.queriesRepository.findOne({
    //   select: [
    //     'project_id',
    //     'env_id',
    //     'connection_id',
    //     'connection_type',
    //     'query_id',
    //     'sql',
    //     'status',
    //     // 'data',
    //     'last_run_by',
    //     'last_run_ts',
    //     'last_cancel_ts',
    //     'last_complete_ts',
    //     'last_complete_duration',
    //     'last_error_message',
    //     'last_error_ts',
    //     'query_job_id',
    //     'bigquery_query_job_id',
    //     'bigquery_consecutive_errors_get_job',
    //     'bigquery_consecutive_errors_get_results',
    //     'server_ts'
    //   ],
    //   where: {
    //     query_id: queryId,
    //     project_id: projectId
    //   }
    // });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async getQueryCheckExists(item: { queryId: string; projectId: string }) {
    let { queryId, projectId } = item;

    let query = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, queryId),
        eq(queriesTable.projectId, projectId)
      )
    });

    // let query = await this.queriesRepository.findOne({
    //   where: {
    //     query_id: queryId,
    //     project_id: projectId
    //   }
    // });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async getQueriesCheckExistSkipSqlData(item: {
    queryIds: string[];
    projectId: string;
  }) {
    let { queryIds, projectId } = item;

    let queries = (await this.db.drizzle
      .select({
        projectId: queriesTable.projectId,
        envId: queriesTable.envId,
        connectionId: queriesTable.connectionId,
        connectionType: queriesTable.connectionType,
        queryId: queriesTable.queryId,
        sql: queriesTable.sql,
        status: queriesTable.status,
        // data: ...,
        lastRunBy: queriesTable.lastRunBy,
        lastRunTs: queriesTable.lastRunTs,
        lastCancelTs: queriesTable.lastCancelTs,
        lastCompleteTs: queriesTable.lastCompleteTs,
        lastCompleteDuration: queriesTable.lastCompleteDuration,
        lastErrorMessage: queriesTable.lastErrorMessage,
        lastErrorTs: queriesTable.lastErrorTs,
        queryJobId: queriesTable.queryJobId,
        bigqueryQueryJobId: queriesTable.bigqueryQueryJobId,
        bigqueryConsecutiveErrorsGetJob:
          queriesTable.bigqueryConsecutiveErrorsGetJob,
        bigqueryConsecutiveErrorsGetResults:
          queriesTable.bigqueryConsecutiveErrorsGetResults,
        serverTs: queriesTable.serverTs
      })
      .from(queriesTable)
      .where(
        and(
          inArray(queriesTable.queryId, queryIds),
          eq(queriesTable.projectId, projectId)
        )
      )) as schemaPostgres.QueryEnt[];

    // let queries = await this.queriesRepository.find({
    //   select: [
    //     'project_id',
    //     'env_id',
    //     'connection_id',
    //     'connection_type',
    //     'query_id',
    //     // 'sql',
    //     'status',
    //     // 'data',
    //     'last_run_by',
    //     'last_run_ts',
    //     'last_cancel_ts',
    //     'last_complete_ts',
    //     'last_complete_duration',
    //     'last_error_message',
    //     'last_error_ts',
    //     'query_job_id',
    //     'bigquery_query_job_id',
    //     'bigquery_consecutive_errors_get_job',
    //     'bigquery_consecutive_errors_get_results',
    //     'server_ts'
    //   ],
    //   where: {
    //     query_id: In(queryIds),
    //     project_id: projectId
    //   }
    // });

    let notFoundQueryIds: string[] = [];

    queryIds.forEach(x => {
      if (queries.map(query => query.queryId).indexOf(x) < -1) {
        notFoundQueryIds.push(x);
      }
    });

    if (notFoundQueryIds.length > 0) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERIES_DO_NOT_EXIST,
        data: {
          notFoundQueryIds: notFoundQueryIds
        }
      });
    }

    return queries;
  }

  async removeOrphanedQueries() {
    let rawData = await this.db.drizzle.execute(sql`
SELECT
  q.query_id
FROM queries as q
LEFT JOIN mconfigs as m ON q.query_id=m.query_id
WHERE m.mconfig_id is NULL
      `);

    //     let rawData: any;

    //     await this.dataSource.transaction(async manager => {
    //       rawData = await manager.query(`
    // SELECT
    //   q.query_id
    // FROM queries as q
    // LEFT JOIN mconfigs as m ON q.query_id=m.query_id
    // WHERE m.mconfig_id is NULL
    // `);
    //     });

    let orphanedQueryIds: string[] =
      rawData.rows.map((x: any) => x.query_id) || [];

    if (orphanedQueryIds.length > 0) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await tx
                .delete(queriesTable)
                .where(inArray(queriesTable.queryId, orphanedQueryIds))
          ),
        getRetryOption(this.cs, this.logger)
      );

      // await this.queriesRepository.delete({ query_id: In(orphanedQueryIds) });
    }
  }

  async checkBigqueryRunningQueries() {
    let queries = await this.db.drizzle.query.queriesTable.findMany({
      where: and(
        eq(queriesTable.status, common.QueryStatusEnum.Running),
        eq(queriesTable.connectionType, common.ConnectionTypeEnum.BigQuery)
      )
    });

    // let queries = await this.queriesRepository.find({
    //   where: {
    //     status: common.QueryStatusEnum.Running,
    //     connection_type: common.ConnectionTypeEnum.BigQuery
    //   }
    // });

    await asyncPool(8, queries, async (query: schemaPostgres.QueryEnt) => {
      try {
        let connection = await this.db.drizzle.query.connectionsTable.findFirst(
          {
            where: and(
              eq(connectionsTable.projectId, query.projectId),
              eq(connectionsTable.connectionId, query.connectionId)
            )
          }
        );

        // let connection = await this.connectionsRepository.findOne({
        //   where: {
        //     project_id: query.project_id,
        //     connection_id: query.connection_id
        //   }
        // });

        if (common.isUndefined(connection)) {
          query.status = common.QueryStatusEnum.Error;
          query.data = [];
          query.lastErrorMessage = `Project connection not found`;
          query.lastErrorTs = makeTsNumber();

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [query]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );

          // await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [query]
          //   }
          // });

          return;
        }

        let bigquery = new BigQuery({
          credentials: connection.bigqueryCredentials,
          projectId: connection.bigqueryProject
        });

        let bigqueryQueryJob = bigquery.job(query.bigqueryQueryJobId);

        let itemQueryJob = await bigqueryQueryJob
          .get()
          .catch(async (e: any) => {
            if (query.bigqueryConsecutiveErrorsGetJob > 2) {
              query.status = common.QueryStatusEnum.Error;
              query.data = [];
              query.lastErrorMessage = `Bigquery get Job fail`;
              query.lastErrorTs = makeTsNumber();
            } else {
              query.bigqueryConsecutiveErrorsGetJob =
                query.bigqueryConsecutiveErrorsGetJob + 1;
            }

            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [query]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );

            // await this.dbService.writeRecords({
            //   modify: true,
            //   records: {
            //     queries: [query]
            //   }
            // });

            return;
          });

        query.bigqueryConsecutiveErrorsGetJob = 0;

        await retry(
          async () =>
            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.write({
                  tx: tx,
                  insertOrUpdate: {
                    queries: [query]
                  }
                })
            ),
          getRetryOption(this.cs, this.logger)
        );

        // await this.dbService.writeRecords({
        //   modify: true,
        //   records: {
        //     queries: [query]
        //   }
        // });

        let queryJob = (itemQueryJob as any)[0];
        let queryJobGetResponse: any = (itemQueryJob as any)[1];

        if (queryJobGetResponse.status.state === 'DONE') {
          if (queryJobGetResponse.status.errorResult) {
            let errorResult = queryJobGetResponse.status.errorResult;

            query.status = common.QueryStatusEnum.Error;
            query.data = [];
            query.lastErrorMessage =
              `Query fail. ` +
              `Message: '${errorResult.message}'. ` +
              `Reason: '${errorResult.reason}'. ` +
              `Location: '${errorResult.location}'.`;
            query.lastErrorTs = makeTsNumber();

            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [query]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );

            // await this.dbService.writeRecords({
            //   modify: true,
            //   records: {
            //     queries: [query]
            //   }
            // });
          } else {
            let queryResultsItem = await queryJob
              .getQueryResults()
              .catch(async (e: any) => {
                if (query.bigqueryConsecutiveErrorsGetResults > 2) {
                  query.status = common.QueryStatusEnum.Error;
                  query.data = [];
                  query.lastErrorMessage = `Bigquery get QueryResults fail`;
                  query.lastErrorTs = makeTsNumber();
                } else {
                  query.bigqueryConsecutiveErrorsGetResults =
                    query.bigqueryConsecutiveErrorsGetResults + 1;
                }

                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
                          tx: tx,
                          insertOrUpdate: {
                            queries: [query]
                          }
                        })
                    ),
                  getRetryOption(this.cs, this.logger)
                );

                // await this.dbService.writeRecords({
                //   modify: true,
                //   records: {
                //     queries: [query]
                //   }
                // });

                return;
              });

            let newLastCompleteTs = makeTsNumber();
            let newLastCompleteDuration = Math.floor(
              (Number(newLastCompleteTs) - Number(query.lastRunTs)) / 1000
            );

            query.status = common.QueryStatusEnum.Completed;
            // no need for query.bigquery_consecutive_errors_get_results = 0
            // because status change to Completed
            query.data = queryResultsItem[0];
            query.lastCompleteTs = newLastCompleteTs;
            query.lastCompleteDuration = newLastCompleteDuration;

            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [query]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );

            // await this.dbService.writeRecords({
            //   modify: true,
            //   records: {
            //     queries: [query]
            //   }
            // });
          }
        }
      } catch (e) {
        logToConsoleBackend({
          log: new common.ServerError({
            message:
              common.ErEnum.BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY,
            originalError: e
          }),
          logLevel: common.LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }
}
