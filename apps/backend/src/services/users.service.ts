import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: repositories.UsersRepository,
    private connection: Connection
  ) {}

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

    if (helper.isUndefined(alias)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_USER_ALIAS_IS_UNDEFINED
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

  async addFirstUser(item: { email: string; password: string }) {
    let { email, password } = item;

    let { salt, hash } = await this.makeSaltAndHash(password);

    let alias = await this.makeAlias(email);

    let user = gen.makeUser({
      email: email,
      isEmailVerified: common.BoolEnum.TRUE,
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
