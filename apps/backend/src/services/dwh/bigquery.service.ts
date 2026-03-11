import { BigQuery, BigQueryOptions, JobResponse } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import type {
  ConnectionTab,
  QueryTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ConnectionSchema,
  SchemaColumn,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import { QueryEstimate } from '#common/interfaces/backend/query-estimate';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';

@Injectable()
export class BigQueryService {
  constructor() {}

  optionsToBigQueryOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let connectionOptions: BigQueryOptions = {
      credentials: connection.options.bigquery.serviceAccountCredentials,
      projectId: connection.options.bigquery.googleCloudProject
    };

    return connectionOptions;
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let bigqueryConnectionOptions = this.optionsToBigQueryOptions({
      connection: connection
    });

    try {
      let bigquery = new BigQuery(bigqueryConnectionOptions);

      await bigquery.query('SELECT 1');

      return {
        isSuccess: true,
        errorMessage: undefined
      };
    } catch (err: any) {
      return {
        isSuccess: false,
        errorMessage: `Connection failed: ${err.message}`
      };
    }
  }

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
    let { connection } = item;

    let bigqueryConnectionOptions = this.optionsToBigQueryOptions({
      connection: connection
    });

    try {
      let bigquery = new BigQuery(bigqueryConnectionOptions);

      let [datasets] = await bigquery.getDatasets();

      let allTablesRows: {
        table_schema: string;
        table_name: string;
        table_type: string;
      }[] = [];

      let allColumnsRows: {
        table_schema: string;
        table_name: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
      }[] = [];

      for (let dataset of datasets) {
        let datasetId = dataset.id;

        try {
          let [tablesRows] = await bigquery.query(`
            SELECT table_schema, table_name, table_type
            FROM \`${datasetId}\`.INFORMATION_SCHEMA.TABLES

            ORDER BY table_schema, table_name
          `);
          allTablesRows.push(...tablesRows);

          let [columnsRows] = await bigquery.query(`
            SELECT table_schema, table_name, column_name, data_type, is_nullable
            FROM \`${datasetId}\`.INFORMATION_SCHEMA.COLUMNS
            ORDER BY table_schema, table_name, ordinal_position
          `);
          allColumnsRows.push(...columnsRows);
        } catch (datasetErr: any) {
          // Some datasets may not be accessible, skip
        }
      }

      let tables: SchemaTable[] = allTablesRows.map(row => {
        let columns: SchemaColumn[] = allColumnsRows
          .filter(
            c =>
              c.table_schema === row.table_schema &&
              c.table_name === row.table_name
          )
          .map(c => ({
            columnName: c.column_name,
            dataType: c.data_type,
            isNullable: c.is_nullable === 'YES'
          }));

        return {
          schemaName: row.table_schema,
          tableName: row.table_name,
          tableType: row.table_type,
          columns: columns,
          indexes: [] as SchemaTable['indexes']
        };
      });

      return {
        tables: tables,
        lastRefreshedTs: Date.now(),
        errorMessage: undefined
      };
    } catch (err: any) {
      return {
        tables: [],
        lastRefreshedTs: Date.now(),
        errorMessage: `Schema fetch failed: ${err.message}`
      };
    }
  }

  async runQuery(item: {
    userId: string;
    query: QueryTab;
    connection: ConnectionTab;
  }): Promise<QueryTab> {
    let { query, userId, connection } = item;

    let bigqueryConnectionOptions = this.optionsToBigQueryOptions({
      connection: connection
    });

    let bigquery = new BigQuery(bigqueryConnectionOptions);

    query.lastRunBy = userId;
    query.lastRunTs = makeTsNumber();
    query.bigqueryQueryJobId = null;
    query.bigqueryConsecutiveErrorsGetJob = 0;
    query.bigqueryConsecutiveErrorsGetResults = 0;

    let maximumBytesBilled =
      connection.options.bigquery.bigqueryQuerySizeLimitGb * 1024 * 1024 * 1024;

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: false,
        useLegacySql: false,
        query: query.sql,
        maximumBytesBilled: maximumBytesBilled.toString()
      })
      .catch(e => {
        query.status = QueryStatusEnum.Error;
        query.data = [];
        query.lastErrorMessage = e.message;
        query.lastErrorTs = makeTsNumber();
      });

    if (isDefined(createQueryJobItem)) {
      let queryJob = (createQueryJobItem as JobResponse)[0];
      let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

      query.status = QueryStatusEnum.Running;
      query.bigqueryQueryJobId = queryJob.id;
    }

    return query;
  }

  async runQueryDry(item: { query: QueryTab; connection: ConnectionTab }) {
    let { query, connection } = item;

    let validEstimate: QueryEstimate;
    let errorQuery: QueryTab;

    let bigquery = new BigQuery({
      credentials: connection.options.bigquery.serviceAccountCredentials,
      projectId: connection.options.bigquery.googleCloudProject
    });

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: true,
        useLegacySql: false,
        query: query.sql
      })
      .catch(e => {
        query.status = QueryStatusEnum.Error;
        query.data = [];
        query.lastErrorMessage = e.message;
        query.lastErrorTs = makeTsNumber();

        errorQuery = query;
      });

    if (isDefined(createQueryJobItem)) {
      let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

      let estimate = Number(
        createQueryJobApiResponse.statistics.totalBytesProcessed
      );

      validEstimate = {
        queryId: query.queryId,
        estimate: estimate,
        lastRunDryTs: makeTsNumber()
      };
    }

    return {
      validEstimate: validEstimate,
      errorQuery: errorQuery
    };
  }
}
