import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';

let retry = require('async-retry');

@Injectable()
export class UsersService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  checkUserHashIsDefined(item: { user: UserEnt }) {
    let { user } = item;

    if (isUndefined(user.hash)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }
  }

  async getUserCheckExists(item: { userId: string }) {
    let { userId } = item;

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.userId, userId)
    });

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }

  async getUserByEmailCheckExists(item: { email: string }) {
    let { email } = item;

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.email, email)
    });

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
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

    let user: UserEnt = {
      userId: makeId(),
      email: email,
      passwordResetToken: undefined,
      passwordResetExpiresTs: undefined,
      isEmailVerified: true,
      emailVerificationToken: makeId(),
      hash: hash,
      salt: salt,
      jwtMinIat: undefined,
      alias: alias,
      firstName: undefined, // null
      lastName: undefined, // null
      ui: makeCopy(DEFAULT_SRV_UI),
      serverTs: undefined
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    return user;
  }

  async makeAlias(email: string) {
    let reg = MyRegex.CAPTURE_ALIAS();
    let r = reg.exec(email);

    let alias = r ? r[1] : undefined;

    if (isUndefined(alias)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_ALIAS_IS_UNDEFINED
      });
    }

    let count = 2;

    let restart = true;

    while (restart) {
      let aliasUser = await this.db.drizzle.query.usersTable.findFirst({
        where: eq(usersTable.alias, alias)
      });

      if (isDefined(aliasUser)) {
        alias = `${alias}${count}`;
        count++;
      } else {
        restart = false;
      }
    }

    return alias;
  }
}
