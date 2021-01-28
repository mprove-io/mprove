import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Connection } from 'typeorm';
import { api } from '~/barrels/api';
import { db } from '~/barrels/db';
import { gen } from '~/barrels/gen';
import { helper } from '~/barrels/helper';
import { repositories } from '~/barrels/repositories';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: repositories.UserRepository,
    private connection: Connection
  ) {}

  async validateUser(userId: string, password: string) {
    let user = await this.userRepository.findOne(userId);

    if (helper.isUndefined(user)) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (helper.isUndefined(user.hash)) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }

    let hash = await bcrypt.hash(password, user.salt);

    if (hash !== user.hash) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_WRONG_PASSWORD
      });
    }

    return user;
  }

  async makeSaltAndHash(password: string) {
    // let salt = crypto.randomBytes(16).toString('hex');
    // let hash = crypto
    //   .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    //   .toString('hex');

    let salt = await bcrypt.genSalt();
    let hash = await bcrypt.hash(password, salt);

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

    let { salt, hash } = await this.makeSaltAndHash(password);

    let alias = await this.makeAlias(userId);

    let user = gen.makeUser({
      userId: userId,
      isEmailVerified: api.BoolEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias
    });

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          users: [user]
        }
      });
    });
  }
}
