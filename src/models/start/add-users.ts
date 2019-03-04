import { getConnection } from 'typeorm';
import { api } from '../../barrels/api';
import { config } from '../../barrels/config';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { generator } from '../../barrels/generator';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';

export async function addUsers() {

  let storeUsers = store.getUsersRepo();

  let usersDb = <entities.UserEntity[]>await storeUsers.find()
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND));

  if (usersDb.length > 0) {
    return;
  }

  let admins = [{
    user_id: config.ADMIN_1_USER_ID,
    alias: config.ADMIN_1_ALIAS
  }];

  let users = admins.map(demoAdmin => generator.makeUser({
    user_id: demoAdmin.user_id,
    alias: demoAdmin.alias,
    status: api.UserStatusEnum.Pending,
  }));

  // update server_ts

  let newServerTs = helper.makeTs();

  users = helper.refreshServerTs(users, newServerTs);

  // save to database

  let connection = getConnection();

  await connection.transaction(async manager => {

    await store.insert({
      manager: manager,
      records: {
        users: users,
      },
      skip_chunk: true, // no sessions needs to be updated on server start
      server_ts: newServerTs,
      source_init_id: undefined,
    })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT));
  })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
