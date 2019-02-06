import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { sender } from '../../../barrels/sender';
import { validator } from '../../../barrels/validator';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';

import * as crypto from 'crypto';
import { enums } from '../../../barrels/enums';
import { store } from '../../../barrels/store';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';
import { ServerError } from '../../server-error';
import { getConnection } from 'typeorm';

export async function registerUser(req: Request, res: Response) {
  let payload: api.RegisterUserRequestBody['payload'] = validator.getPayload(
    req
  );

  let userId = payload.user_id;
  let password = payload.password;

  let salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');

  let storeUsers = store.getUsersRepo();

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (user && !!user.hash) {
    throw new ServerError({
      name: enums.otherErrorsEnum.REGISTER_ERROR_USER_ALREADY_EXISTS
    });
  }

  if (user) {
    // A
    user.hash = hash;
    user.salt = salt;

    // A - update server_ts
    let newServerTs = helper.makeTs();
    user.server_ts = newServerTs;

    // A - save to database

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
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
      );
  } else {
    // B

    let alias = <string>(
      await proc
        .findAlias(userId)
        .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_FIND_ALIAS))
    );

    let newUser = generator.makeUser({
      user_id: userId,
      email_verified: enums.bEnum.FALSE,
      hash: hash,
      salt: salt,
      alias: alias
    });

    // B - update server_ts

    let newServerTs = helper.makeTs();
    newUser.server_ts = newServerTs;

    // B - save to database

    let connection = getConnection();

    await connection
      .transaction(async manager => {
        await store
          .insert({
            manager: manager,
            records: {
              users: [newUser]
            },
            server_ts: newServerTs,
            skip_chunk: true,
            source_init_id: undefined
          })
          .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
      })
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
      );
  }

  let responsePayload: api.RegisterUserResponse200Body['payload'] = {
    user_id: userId
  };

  sender.sendClientResponse(req, res, responsePayload);
}
