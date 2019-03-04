import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';

export async function pong(req: Request, res: Response) {
  let payload: api.PongRequestBody['payload'] = validator.getPayload(req);

  let storeSessions = store.getSessionsRepo();

  let session = await storeSessions
    .findOne({
      session_id: payload.init_id
    })
    .catch(e =>
      helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_FIND_ONE)
    );

  if (session) {
    session.last_pong_ts = helper.makeTs();

    await storeSessions
      .save(session)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_SAVE));
  }

  // response

  let responsePayload: api.PongResponse200Body['payload'] = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
