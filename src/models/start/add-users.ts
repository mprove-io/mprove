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
import { forEach } from 'p-iteration';
import { UserEntity } from '../store/entities/_index';

export async function addUsers() {
  let storeUsers = store.getUsersRepo();

  let usersDb = <entities.UserEntity[]>(
    await storeUsers
      .find()
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND))
  );

  if (usersDb.length > 0) {
    return;
  }

  let users: UserEntity[] = [];

  await forEach(config.admins, async admin => {
    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto
      .pbkdf2Sync(admin.first_password, salt, 1000, 64, 'sha512')
      .toString('hex');

    let alias = await proc.findAlias(admin.user_id);

    let user = generator.makeUser({
      user_id: admin.user_id,
      email_verified: enums.bEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias,
      status: api.UserStatusEnum.Pending
    });

    users.push(user);
  });

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
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
