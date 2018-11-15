import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';

export async function setLiveQueries(req: Request, res: Response) {
  let payload: api.SetLiveQueriesRequestBodyPayload = validator.getPayload(req);

  let liveQueries = payload.live_queries;
  let server_ts = payload.server_ts;

  let newServerTs = helper.makeTs();

  // response

  let responsePayload: api.SetLiveQueriesResponse200BodyPayload = {
    live_queries: liveQueries,
    server_ts: Number(newServerTs)
  };

  sender.sendClientResponse(req, res, responsePayload);
}
