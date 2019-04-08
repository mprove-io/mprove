import { Request, Response } from 'express';
import { getConnection, In } from 'typeorm';
import { api } from '../../../barrels/api';
import { blockml } from '../../../barrels/blockml';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { interfaces } from '../../../barrels/interfaces';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function duplicateMconfigAndQuery(req: Request, res: Response) {
  let initId = validator.getRequestInfoInitId(req);

  let payload: api.DuplicateMconfigAndQueryRequestBody['payload'] = validator.getPayload(
    req
  );

  let queries: entities.QueryEntity[] = [];

  let storeMconfigs = store.getMconfigsRepo();
  let storeQueries = store.getQueriesRepo();

  let mconfig = <entities.MconfigEntity>await storeMconfigs
    .findOne({
      mconfig_id: payload.mconfig_id
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_MCONFIGS_FIND_ONE)
    );

  let query = <entities.QueryEntity>await storeQueries
    .findOne({
      query_id: payload.query_id
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND_ONE)
    );

  let newMconfigId = helper.makeId();
  let newQueryId = helper.makeId();

  let newMconfig = Object.assign({}, mconfig, {
    mconfig_id: newMconfigId,
    query_id: newQueryId,
    temp: true
  });

  let newQuery = Object.assign({}, query, {
    query_id: newQueryId,
    status:
      query.last_cancel_ts > query.last_complete_ts &&
      query.last_cancel_ts > query.last_error_ts
        ? api.QueryStatusEnum.Canceled
        : query.last_error_ts > query.last_complete_ts &&
          query.last_error_ts > query.last_cancel_ts
        ? api.QueryStatusEnum.Error
        : query.last_complete_ts > query.last_cancel_ts &&
          query.last_complete_ts > query.last_error_ts
        ? api.QueryStatusEnum.Completed
        : api.QueryStatusEnum.New,
    temp: true,
    is_checking: false
  });

  // update server_ts
  let newServerTs = helper.makeTs();

  newMconfig.server_ts = newServerTs;
  newQuery.server_ts = newServerTs;

  // save to database
  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            mconfigs: [newMconfig],
            queries: [newQuery]
          },
          server_ts: newServerTs,
          source_init_id: initId
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // add dep queries
  queries.push(newQuery);

  let pdtDepsAll = JSON.parse(newQuery.pdt_deps_all);

  if (pdtDepsAll.length > 0) {
    let depQueries = <entities.QueryEntity[]>await storeQueries
      .find({
        pdt_id: In(pdtDepsAll)
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

    if (depQueries && depQueries.length > 0) {
      queries = helper.makeNewArray(queries, depQueries);
    }
  }

  // response

  let responsePayload: api.DuplicateMconfigAndQueryResponse200Body['payload'] = {
    mconfig: wrapper.wrapToApiMconfig(newMconfig),
    queries: queries.map(q => wrapper.wrapToApiQuery(q))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
