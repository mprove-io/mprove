import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { store } from '../../../barrels/store';
import { enums } from '../../../barrels/enums';
import { SessionEntity } from '../../store/entities/_index';

export async function setLiveQueries(req: Request, res: Response) {
  let payload: api.SetLiveQueriesRequestBody['payload'] = validator.getPayload(
    req
  );

  let liveQueries = payload.live_queries;
  let initId = payload.init_id;

  let storeSessions = store.getSessionsRepo();

  let session = <SessionEntity>await storeSessions
    .findOne({
      session_id: initId
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_FIND_ONE)
    );

  session.live_queries = JSON.stringify(liveQueries);

  await storeSessions
    .save(session)
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_SAVE));

  let newServerTs = helper.makeTs();

  // response

  let responsePayload: api.SetLiveQueriesResponse200Body['payload'] = {
    live_queries: liveQueries,
    server_ts: Number(newServerTs)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
