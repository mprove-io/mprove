import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';

let retry = require('async-retry');

@Injectable()
export class UsersService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  checkUserHashIsDefined(item: { user: schemaPostgres.UserEnt }) {
    let { user } = item;

    if (common.isUndefined(user.hash)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }
  }

  async getUserCheckExists(item: { userId: string }) {
    let { userId } = item;

    // await this.usersRepository.findOne({
    //   where: {
    //     user_id: userId
    //   }
    // });

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.userId, userId)
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

    // let user = await this.usersRepository.findOne({
    //   where: {
    //     email: email
    //   }
    // });

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.email, email)
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

  async addFirstUser(item: { email: string; password: string }) {
    let { email, password } = item;

    let { salt, hash } = await this.makeSaltAndHash(password);

    let alias = await this.makeAlias(email);

    let user: schemaPostgres.UserEnt = {
      userId: common.makeId(),
      email: email,
      passwordResetToken: undefined,
      passwordResetExpiresTs: undefined,
      isEmailVerified: true,
      emailVerificationToken: common.makeId(),
      hash: hash,
      salt: salt,
      jwtMinIat: undefined,
      alias: alias,
      firstName: undefined, // null
      lastName: undefined, // null
      timezone: common.USE_PROJECT_TIMEZONE_VALUE,
      ui: constants.DEFAULT_UI,
      serverTs: undefined
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insert: {
              users: [user]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    // let user = maker.makeUser({
    //   email: email,
    //   isEmailVerified: common.BoolEnum.TRUE,
    //   salt: salt,
    //   hash: hash,
    //   alias: alias
    // });

    // let records = await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     users: [user]
    //   }
    // });

    return user;
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
      // let aliasUser = await this.usersRepository.findOne({
      //   where: { alias: alias }
      // });

      let aliasUser = await this.db.drizzle.query.usersTable.findFirst({
        where: eq(usersTable.alias, alias)
      });

      if (common.isDefined(aliasUser)) {
        alias = `${alias}${count}`;
        count++;
      } else {
        restart = false;
      }
    }

    return alias;
  }
}
