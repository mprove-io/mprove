import { Result } from '@praha/byethrow';
import axios from 'axios';
import { and, eq } from 'drizzle-orm';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import type { StoreUserCodeReturn } from '#backend/functions/db/mconfigs/prep-store-mconfig-query/transform-store-request/transform-store-request';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { transformStoreResponseData } from '#backend/functions/store/run-query/transform-store-response-data/transform-store-response-data';
import type { DbService } from '#backend/services/db/db.service';
import type { UrlService } from '#backend/services/url/url.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckApiUrlError } from '#common/types/backend/function-errors/check-api-url-error';
import type { StoreMethod } from '#common/types/blockml/parts/store/store-method';

export async function runQuery(item: {
  projectId: string;
  connection: ConnectionTab;
  model: ModelTab;
  queryId: string;
  queryJobId: string;
  db: DbService;
  urlService: UrlService;
}): Promise<void> {
  let { connection, queryJobId, queryId, projectId, model, db, urlService } =
    item;

  let queryStart: QueryTab = await db.queries.findFirstUnwrap({
    where: and(
      eq(queriesTable.queryId, queryId),
      eq(queriesTable.queryJobId, queryJobId),
      eq(queriesTable.projectId, projectId)
    )
  });

  try {
    let body = queryStart.apiBody;

    let url = queryStart.apiUrl;

    let apiUrlResult: Result.Result<void, CheckApiUrlError> =
      await urlService.checkApiUrl({ urlStr: url });

    if (Result.isFailure(apiUrlResult)) {
      // This worker's terminal boundary rejects into its existing error-status
      // handling. Keep the domain code/details without classifying exceptions.
      throw new ServerError({
        message: apiUrlResult.error.code,
        displayData: apiUrlResult.error.displayData,
        customData:
          'customData' in apiUrlResult.error
            ? apiUrlResult.error.customData
            : undefined
      });
    }

    let headers: any = {};

    let response;

    if (connection.type === 'Api') {
      connection.options.storeApi.headers.forEach(header => {
        headers[header.key] = header.value;
      });
    } else if (connection.type === 'GoogleApi') {
      connection.options.storeGoogleApi.headers.forEach(header => {
        headers[header.key] = header.value;
      });

      headers['Authorization'] =
        `Bearer ${connection.options.storeGoogleApi.googleAccessToken}`;

      headers['Content-Type'] = 'application/json';
    }

    response =
      queryStart.apiMethod === ('POST' satisfies StoreMethod)
        ? await axios.post(url, body, { headers: headers })
        : queryStart.apiMethod === ('GET' satisfies StoreMethod)
          ? await axios.get(url, { headers: headers })
          : { message: 'method must be POST or GET' };

    let q: QueryTab = await db.queries.findFirstUnwrap({
      where: and(
        eq(queriesTable.queryId, queryId),
        eq(queriesTable.queryJobId, queryJobId),
        eq(queriesTable.projectId, projectId)
      )
    });

    if (isDefined(q)) {
      if (response.status !== 200 && response.status !== 201) {
        q.status = 'Error';

        q.data = [];

        q.queryJobId = undefined;

        q.lastErrorMessage = `response status code "${response.status}" is not 200 or 201`;

        q.lastErrorTs = makeTsNumber();
      } else if (isUndefined(response.data)) {
        q.status = 'Error';

        q.data = [];

        q.queryJobId = undefined;

        q.lastErrorMessage = `response has no data`;

        q.lastErrorTs = makeTsNumber();
      } else {
        let dataResult: StoreUserCodeReturn = await transformStoreResponseData({
          storeModel: model,
          respData: response.data
        });

        if (isDefined(dataResult.errorMessage)) {
          q.status = 'Error';

          q.data = [];

          q.queryJobId = undefined;

          q.lastErrorMessage = `store response data processing Error: ${dataResult.errorMessage}`;

          q.lastErrorTs = makeTsNumber();
        } else {
          q.status = 'Completed';

          q.queryJobId = undefined;

          q.data = isDefined(dataResult.result)
            ? JSON.parse(dataResult.result) || []
            : [];

          q.lastCompleteTs = makeTsNumber();

          q.lastCompleteDuration = Math.floor(
            (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
          );
        }
      }

      await db.writeUnwrap({
        insertOrUpdate: {
          queries: [q]
        }
      });
    }
  } catch (e: any) {
    let q: QueryTab = await db.queries.findFirstUnwrap({
      where: and(
        eq(queriesTable.queryId, queryId),
        eq(queriesTable.queryJobId, queryJobId),
        eq(queriesTable.projectId, projectId)
      )
    });

    if (isDefined(q)) {
      q.status = 'Error';

      q.data = [];

      q.queryJobId = undefined;

      q.lastErrorMessage = isDefined(e?.response?.data)
        ? e.message + JSON.stringify(e?.response?.data)
        : e.message;

      q.lastErrorTs = makeTsNumber();

      await db.writeUnwrap({
        insertOrUpdate: {
          queries: [q]
        }
      });
    }
  }
}
