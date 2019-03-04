import { Request, Response } from 'express';
import { In } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';

export async function getQueryWithDepQueries(req: Request, res: Response) {
  let payload: api.GetQueryWithDepQueriesRequestBody['payload'] = validator.getPayload(
    req
  );

  let queryId = payload.query_id;

  let queries: entities.QueryEntity[] = [];

  let storeQueries = store.getQueriesRepo();

  let query = <entities.QueryEntity>await storeQueries
    .findOne({
      query_id: queryId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND_ONE)
    );

  if (query) {
    queries.push(query);

    let pdtDepsAll = JSON.parse(query.pdt_deps_all);

    if (pdtDepsAll.length > 0) {
      let depQueries = <entities.QueryEntity[]>await storeQueries
        .find({
          pdt_id: In(pdtDepsAll)
        })
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND)
        );

      if (depQueries && depQueries.length > 0) {
        queries = helper.makeNewArray(queries, depQueries);
      }
    }
  }

  // response

  let responsePayload: api.GetQueryWithDepQueriesResponse200Body['payload'] = {
    queries: queries.map(q => wrapper.wrapToApiQuery(q))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
