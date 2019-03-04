import { In } from 'typeorm';
import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';

const { BigQuery } = require('@google-cloud/bigquery');

export async function runQueryDry(item: {
  bigquery_project: string;
  query: entities.QueryEntity;
  new_last_run_dry_ts: number;
  credentials_file_path: string;
}): Promise<interfaces.ItemRunQueryDry> {
  let query = item.query;
  let validEstimate: api.QueryEstimate;
  let errorQuery: entities.QueryEntity;

  let pdtDepsAllQueries: entities.QueryEntity[] = [];
  let index;

  let pdtDepsAll: string[] = JSON.parse(query.pdt_deps_all);

  if (pdtDepsAll.length > 0) {
    let storeQueries = store.getQueriesRepo();

    pdtDepsAllQueries = <entities.QueryEntity[]>await storeQueries
      .find({
        pdt_id: In(pdtDepsAll)
      })
      .catch((e: any) =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND)
      );

    index = pdtDepsAllQueries.findIndex(
      pdtQuery => Number(pdtQuery.last_complete_ts) <= 1
    );
  }

  if (pdtDepsAllQueries.length > 0 && index > -1) {
    let estimate = -1;

    validEstimate = {
      query_id: query.query_id,
      estimate: estimate,
      last_run_dry_ts: item.new_last_run_dry_ts
    };
  } else {
    let bigquery = new BigQuery({
      projectId: item.bigquery_project,
      keyFilename: item.credentials_file_path
    });

    let sqlArray: string[] = JSON.parse(query.sql);
    let sqlText = sqlArray.join('\n');

    let resultItem = <any>await bigquery
      .createQueryJob({
        dryRun: true,
        useLegacySql: false,
        query: sqlText
      })
      .catch((e: any) => {
        let lastErrorTs = helper.makeTs();

        query.status = api.QueryStatusEnum.Error; // do not set last_run_ts
        query.refresh = null;
        query.last_error_message = e.message;
        query.last_error_ts = lastErrorTs;

        errorQuery = query;
      });

    if (resultItem) {
      let apiResponse = resultItem[1];

      let estimate = Number(apiResponse.statistics.totalBytesProcessed);

      validEstimate = {
        query_id: query.query_id,
        estimate: estimate,
        last_run_dry_ts: item.new_last_run_dry_ts
      };
    }
  }

  return {
    valid_estimate: validEstimate,
    error_query: errorQuery
  };
}
