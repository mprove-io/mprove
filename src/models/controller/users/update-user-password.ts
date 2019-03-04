import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { helper } from '../../../barrels/helper';
import { entities } from '../../../barrels/entities';
import { store } from '../../../barrels/store';
import { enums } from '../../../barrels/enums';
import { ServerError } from '../../../models/server-error';
import { getConnection } from 'typeorm';
import * as crypto from 'crypto';

export async function updateUserPassword(req: Request, res: Response) {
  let payload: api.UpdateUserPasswordRequestBody['payload'] = validator.getPayload(
    req
  );

  let token = payload.token;
  let password = payload.password;

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne({ password_reset_token: token })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({
      name: enums.otherErrorsEnum.UPDATE_PASSWORD_ERROR_TOKEN_EXPIRED
    });
  }

  if (Number(user.password_reset_expires_ts) < Number(helper.makeTs())) {
    throw new ServerError({
      name: enums.otherErrorsEnum.UPDATE_PASSWORD_ERROR_TOKEN_EXPIRED
    });
  }

  let salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');

  let newServerTs = helper.makeTs();
  user.server_ts = newServerTs;
  user.hash = hash;
  user.salt = salt;
  user.password_reset_expires_ts = (1).toString();

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            users: [user]
          },
          server_ts: newServerTs,
          skip_chunk: true,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));

  let responsePayload: api.UpdateUserPasswordResponse200Body['payload'] = {
    empty: true
  };

  sender.sendClientResponse(req, res, responsePayload);
}
