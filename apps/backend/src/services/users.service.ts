import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: repositories.UsersRepository,
    private dbService: DbService
  ) {}

  checkUserHashIsDefined(item: { user: entities.UserEntity }) {
    let { user } = item;

    if (common.isUndefined(user.hash)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }
  }

  async getUserCheckExists(item: { userId: string }) {
    let { userId } = item;

    let user = await this.usersRepository.findOne({
      user_id: userId
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }

  async getUserByEmailCheckExists(item: { email: string }) {
    let { email } = item;

    let user = await this.usersRepository.findOne({
      email: email
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
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

  async makeAlias(email: string) {
    let reg = common.MyRegex.CAPTURE_ALIAS();
    let r = reg.exec(email);

    let alias = r ? r[1] : undefined;

    if (common.isUndefined(alias)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_ALIAS_IS_UNDEFINED
      });
    }

    let count = 2;

    let restart = true;

    while (restart) {
      let aliasUser = await this.usersRepository.findOne({ alias: alias });

      if (common.isDefined(aliasUser)) {
        alias = `${alias}${count}`;
        count++;
      } else {
        restart = false;
      }
    }

    return alias;
  }

  async addFirstUser(item: { email: string; password: string }) {
    let { email, password } = item;

    let { salt, hash } = await this.makeSaltAndHash(password);

    let alias = await this.makeAlias(email);

    let user = maker.makeUser({
      email: email,
      isEmailVerified: common.BoolEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias
    });

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        users: [user]
      }
    });

    return records.users[0];
  }
}
