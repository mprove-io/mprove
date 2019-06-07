import { getConnection } from 'typeorm';
import { api } from '../../barrels/api';
import { config } from '../../barrels/config';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { generator } from '../../barrels/generator';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { proc } from '../../barrels/proc';
import * as crypto from 'crypto';
import { UserEntity } from '../store/entities/_index';

export async function addFirstUser() {
  let storeUsers = store.getUsersRepo();

  let usersDb = <entities.UserEntity[]>(
    await storeUsers
      .find()
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND))
  );

  if (usersDb.length > 0) {
    return;
  }

  let userId = process.env.BACKEND_FIRST_USER_EMAIL;
  let userFirstPassword = process.env.BACKEND_FIRST_USER_PASSWORD;

  if (userId && userFirstPassword) {
    let users: UserEntity[] = [];

    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto
      .pbkdf2Sync(userFirstPassword, salt, 1000, 64, 'sha512')
      .toString('hex');

    let alias = <string>(
      await proc
        .findAlias(userId)
        .catch(e => helper.reThrow(e, enums.procErrorsEnum.PROC_FIND_ALIAS))
    );

    let user = generator.makeUser({
      user_id: userId,
      email_verified: enums.bEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias
    });

    users.push(user);

    // update server_ts

    let newServerTs = helper.makeTs();

    users = helper.refreshServerTs(users, newServerTs);

    // save to database

    let connection = getConnection();

    await connection
      .transaction(async manager => {
        await store
          .insert({
            manager: manager,
            records: {
              users: users
            },
            skip_chunk: true, // no sessions needs to be updated on server start
            server_ts: newServerTs,
            source_init_id: undefined
          })
          .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
      })
      .catch(e =>
        helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
      );
  }
}
