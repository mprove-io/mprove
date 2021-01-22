import { api } from '../barrels/api';
import { helper } from '../barrels/helper';
import { enums } from '../barrels/enums';
import { gen } from '../barrels/gen';
import { db } from '../barrels/db';
import { repositories } from '../barrels/repositories';
import { entities } from '../barrels/entities';

import { Injectable } from '@nestjs/common';
import { Connection, In } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: repositories.UserRepository,
    private connection: Connection
  ) {}

  async findOneById(userId: string): Promise<entities.UserEntity> {
    return await this.userRepository.findOne(userId);
  }

  async deleteUsers(userIds) {
    await this.userRepository.delete({ user_id: In(userIds) });
  }

  makeSaltAndHash(password: string) {
    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    return { salt, hash };
  }

  async makeAlias(userId: string) {
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

  async addFirstUser(item: { userId: string; password: string }) {
    let { userId, password } = item;

    let { salt, hash } = this.makeSaltAndHash(password);

    let alias = await this.makeAlias(userId);

    let user = gen.makeUser({
      userId: userId,
      isEmailVerified: api.BoolEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias
    });

    await this.connection.transaction(async manager => {
      await db.insertRecords({
        manager: manager,
        records: {
          users: [user]
        }
      });
    });
  }
}
