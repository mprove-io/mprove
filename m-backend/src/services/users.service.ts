import { api } from '../barrels/api';
import { helper } from '../barrels/helper';
import { enums } from '../barrels/enums';
import { gen } from '../barrels/gen';
import { db } from '../barrels/db';

import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import * as crypto from 'crypto';
import { repositories } from 'src/barrels/repositories';
import { entities } from 'src/barrels/entities';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: repositories.UserRepository,
    private connection: Connection
  ) {}

  async findOneById(item: { id: string }): Promise<entities.UserEntity> {
    return await this.userRepository.findOne(item.id);
  }

  async addFirstUser(item: { userId: string; password: string }) {
    let { userId, password } = item;

    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    let alias = await this.findAlias({ userId: userId });

    let user = gen.makeUser({
      user_id: userId,
      email_verified: enums.bEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias
    });

    let users = [user];

    let newServerTs = helper.makeTs();
    users = helper.refreshServerTs(users, newServerTs);

    await this.connection.transaction(async manager => {
      await db.insertRecords({
        manager: manager,
        records: {
          users: users
        }
        // skipChunk: true, // no sessions needs to be updated on server start
        // serverTs: newServerTs
        // sourceInitId: undefined
      });
      // .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT))
    });
    // .catch(e =>
    //   helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
    // )
  }

  async findAlias(item: { userId: string }) {
    let { userId } = item;

    let reg = api.MyRegex.CAPTURE_ALIAS();
    let r = reg.exec(userId);

    let alias = r ? r[1] : undefined;

    if (helper.isUndefined(alias)) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_USER_ALIAS_IS_UNDEFINED
      });
    }

    let count = 2;

    let restart = true;

    while (restart) {
      let aliasUser = await this.userRepository.findOne({ alias: alias });

      if (helper.isDefined(aliasUser)) {
        alias = `${alias}${count}`;
        count++;
      } else {
        restart = false;
      }
    }

    return alias;
  }
}
