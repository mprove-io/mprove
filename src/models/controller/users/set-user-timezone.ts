import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { validator } from '../../../barrels/validator';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function setUserTimezone(req: Request, res: Response) {

  let initId = validator.getRequestInfoInitId(req);

  let userId: string = req.user.email;

  let payload: api.SetUserTimezoneRequestBodyPayload = validator.getPayload(req);

  let timezone = payload.timezone;
  let serverTs = payload.server_ts;

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>await storeUsers.findOne(userId) // TODO: deleted
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE));

  if (!user) { throw new ServerError({ name: enums.otherErrorsEnum.USER_NOT_FOUND }); }

  helper.checkServerTs(user, serverTs);

  user.timezone = timezone;

  // update server_ts

  let newServerTs = helper.makeTs();

  user.server_ts = newServerTs;

  // save to database

  let connection = getConnection();

  await connection.transaction(async manager => {

    await store.save({
      manager: manager,
      records: {
        users: [user],
      },
      server_ts: newServerTs,
      source_init_id: initId,
    })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
  })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  // response

  let responsePayload: api.SetUserTimezoneResponse200BodyPayload = {
    user: wrapper.wrapToApiUser(user, enums.bEnum.FALSE),
  };

  sender.sendClientResponse(req, res, responsePayload);
}
