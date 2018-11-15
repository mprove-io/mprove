import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';

export async function getPdtQueries(req: Request, res: Response) {
  let payload: api.GetPdtQueriesRequestBodyPayload = validator.getPayload(req);

  let projectId = payload.project_id;
  let structId = payload.struct_id;

  let queries: entities.QueryEntity[] = [];

  let storeQueries = store.getQueriesRepo();

  queries = <entities.QueryEntity[]>await storeQueries
    .find({
      project_id: projectId,
      struct_id: structId,
      is_pdt: enums.bEnum.TRUE
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND));

  // response

  let responsePayload: api.GetPdtQueriesResponse200BodyPayload = {
    queries: queries.map(query => wrapper.wrapToApiQuery(query))
  };

  sender.sendClientResponse(req, res, responsePayload);
}
