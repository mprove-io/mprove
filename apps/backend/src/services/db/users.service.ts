import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { UserEnt, usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { User } from '~common/interfaces/backend/user';
import { UserLt, UserSt } from '~common/interfaces/st-lt';
import { MyRegex } from '~common/models/my-regex';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class UsersService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(userEnt: UserEnt): UserTab {
    if (isUndefined(userEnt)) {
      return;
    }

    let user: UserTab = {
      ...userEnt,
      ...this.tabService.decrypt<UserSt>({
        encryptedString: userEnt.st
      }),
      ...this.tabService.decrypt<UserLt>({
        encryptedString: userEnt.lt
      })
    };

    return user;
  }

  tabToApi(item: { user: UserTab }): User {
    let { user } = item;

    let defaultSrvUi = makeCopy(DEFAULT_SRV_UI);

    let apiUser: User = {
      userId: user.userId,
      email: user.email,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      ui: {
        timezone: user.ui?.timezone || defaultSrvUi.timezone,
        timeSpec: user.ui?.timeSpec || defaultSrvUi.timeSpec,
        timeRangeFraction:
          user.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,
        //
        projectFileLinks: isDefined(user.ui?.projectFileLinks)
          ? user.ui?.projectFileLinks
          : defaultSrvUi.projectFileLinks,
        //
        projectModelLinks: isDefined(user.ui?.projectModelLinks)
          ? user.ui?.projectModelLinks
          : defaultSrvUi.projectModelLinks,
        //
        projectChartLinks: isDefined(user.ui?.projectChartLinks)
          ? user.ui?.projectChartLinks
          : defaultSrvUi.projectChartLinks,
        //
        projectDashboardLinks: isDefined(user.ui?.projectDashboardLinks)
          ? user.ui?.projectDashboardLinks
          : defaultSrvUi.projectDashboardLinks,
        //
        projectReportLinks: isDefined(user.ui?.projectReportLinks)
          ? user.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,
        //
        modelTreeLevels: isDefined(user.ui?.modelTreeLevels)
          ? user.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels
      },
      serverTs: Number(user.serverTs)
    };

    return apiUser;
  }

  checkUserHashIsDefined(item: { user: UserTab }) {
    let { user } = item;

    if (isUndefined(user.hash)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }
  }

  async getUserCheckExists(item: { userId: string }) {
    let { userId } = item;

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.userId, userId)
      })
      .then(x => this.entToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }

  async getUserByEmailCheckExists(item: { email: string }) {
    let { email } = item;

    let emailHash = this.hashService.makeHash(email);

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.emailHash, emailHash)
      })
      .then(x => this.entToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }

  async makeSaltAndHash(password: string) {
    // TODO: check algo
    // let salt = crypto.randomBytes(16).toString('hex');
    // let hash = crypto
    //   .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    //   .toString('hex');

    let salt = await bcrypt.genSalt();
    let hash = await bcrypt.hash(password, salt);

    return { salt, hash };
  }

  async addMproveAdminUser(item: { email: string; password: string }) {
    let { email, password } = item;

    let { salt, hash } = await this.makeSaltAndHash(password);

    let alias = await this.makeAlias(email);

    let emailVerificationToken = makeId();

    let user: UserTab = {
      userId: makeId(),
      isEmailVerified: true,
      hash: hash,
      salt: salt,
      jwtMinIat: undefined,
      email: email,
      alias: alias,
      firstName: undefined,
      lastName: undefined,
      emailVerificationToken: emailVerificationToken,
      passwordResetToken: undefined,
      passwordResetExpiresTs: undefined,
      ui: makeCopy(DEFAULT_SRV_UI),
      emailHash: this.hashService.makeHash(email),
      aliasHash: this.hashService.makeHash(alias),
      emailVerificationTokenHash: this.hashService.makeHash(
        emailVerificationToken
      ),
      passwordResetTokenHash: undefined,
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
      let aliasHash = this.hashService.makeHash(alias);

      let aliasUser = await this.db.drizzle.query.usersTable.findFirst({
        where: eq(usersTable.aliasHash, aliasHash)
      });

      if (isDefined(aliasUser)) {
        // TODO: check logic
        alias = `${alias}${count}`;
        count++;
      } else {
        restart = false;
      }
    }

    return alias;
  }
}
