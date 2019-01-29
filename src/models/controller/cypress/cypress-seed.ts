import { Request, Response } from 'express';
import { api } from '../../../barrels/api';
import { enums } from '../../../barrels/enums';
import { helper } from '../../../barrels/helper';
import { handler } from '../../../barrels/handler';
import { constants } from '../../../barrels/constants';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { disk } from '../../../barrels/disk';
import { validator } from '../../../barrels/validator';
import { In, getConnection } from 'typeorm';
import { forEach } from 'p-iteration';
import { entities } from '../../../barrels/entities';
import * as crypto from 'crypto';
import { proc } from '../../../barrels/proc';
import { generator } from '../../../barrels/generator';

export async function cypressSeed(req: Request, res: Response) {
  let payload: api.CypressSeedRequestBody['payload'] = validator.getPayload(
    req
  );

  let storeUsers = store.getUsersRepo();
  let storeMembers = store.getMembersRepo();
  let storeRepos = store.getReposRepo();
  let storeFiles = store.getFilesRepo();
  let storeErrors = store.getErrorsRepo();
  let storeModels = store.getModelsRepo();
  let storeMconfigs = store.getMconfigsRepo();
  let storeDashboards = store.getDashboardsRepo();

  let users: entities.UserEntity[] = [];

  if (payload.users) {
    await forEach(payload.users, async x => {
      let salt = crypto.randomBytes(16).toString('hex');
      let hash = crypto
        .pbkdf2Sync(x.password, salt, 1000, 64, 'sha512')
        .toString('hex');

      let alias = await proc.findAlias(x.user_id);

      let user = generator.makeUser({
        user_id: x.user_id,
        email_verified: enums.bEnum.TRUE,
        email_verification_token: x.email_verification_token,
        salt: salt,
        hash: hash,
        alias: alias,
        status: api.UserStatusEnum.Pending
      });

      users.push(user);
    });
  }

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

  // response

  let responsePayload: api.CypressSeedResponse200Body['payload'] = {
    empty: true
  };

  res.json({ payload: payload });
}
