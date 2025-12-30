import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { RESTRICTED_USER_ALIAS } from '~common/constants/top';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { User } from '~common/interfaces/backend/user';
import { MyRegex } from '~common/models/my-regex';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';
import { DconfigsService } from './dconfigs.service';

let retry = require('async-retry');

@Injectable()
export class UsersService {
  constructor(
    private dconfigsService: DconfigsService,
    private tabService: TabService,
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

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

  checkUserPasswordHashIsDefined(item: { user: UserTab }) {
    let { user } = item;

    if (isUndefined(user.passwordHash)) {
      throw new ServerError({
        message: ErEnum.BACKEND_SIGN_UP_TO_SET_PASSWORD
      });
    }
  }

  async getUserCheckExists(item: { userId: string }) {
    let { userId } = item;

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.userId, userId)
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }

  checkUserIsNotRestricted(item: { user: UserTab }) {
    let { user } = item;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }
  }

  async getUserByEmailCheckExists(item: { email: string }) {
    let { email } = item;

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let emailHash = this.hashService.makeHash({
      input: email,
      hashSecret: hashSecret
    });

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.emailHash, emailHash)
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }

  async addMproveAdminUser(item: { email: string; password: string }) {
    let { email, password } = item;

    let passwordHS = await this.hashService.createSaltAndHash({
      input: password
    });

    let alias = await this.makeAlias(email);

    let emailVerificationToken = makeId();

    let user: UserTab = {
      userId: makeId(),
      isEmailVerified: true,
      passwordHash: passwordHS.hash,
      passwordSalt: passwordHS.salt,
      jwtMinIat: undefined,
      email: email,
      alias: alias,
      firstName: undefined,
      lastName: undefined,
      emailVerificationToken: emailVerificationToken,
      passwordResetToken: undefined,
      passwordResetExpiresTs: undefined,
      ui: makeCopy(DEFAULT_SRV_UI),
      emailHash: undefined, // tab-to-ent
      aliasHash: undefined, // tab-to-ent
      emailVerificationTokenHash: undefined, // tab-to-ent
      passwordResetTokenHash: undefined, // tab-to-ent
      keyTag: undefined,
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

  async addDemoUser(item: { email: string; password: string }) {
    let { email, password } = item;

    let passwordHS = await this.hashService.createSaltAndHash({
      input: password
    });

    let alias = await this.makeAlias(email);

    let emailVerificationToken = makeId();

    let user: UserTab = {
      userId: makeId(),
      isEmailVerified: true,
      passwordHash: passwordHS.hash,
      passwordSalt: passwordHS.salt,
      jwtMinIat: undefined,
      email: email,
      alias: alias,
      firstName: 'Demo',
      lastName: 'User',
      emailVerificationToken: emailVerificationToken,
      passwordResetToken: undefined,
      passwordResetExpiresTs: undefined,
      ui: makeCopy(DEFAULT_SRV_UI),
      emailHash: undefined, // tab-to-ent
      aliasHash: undefined, // tab-to-ent
      emailVerificationTokenHash: undefined, // tab-to-ent
      passwordResetTokenHash: undefined, // tab-to-ent
      keyTag: undefined,
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

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let count = 2;

    let restart = true;

    while (restart) {
      let aliasHash = this.hashService.makeHash({
        input: alias,
        hashSecret: hashSecret
      });

      let aliasUser = await this.db.drizzle.query.usersTable.findFirst({
        where: eq(usersTable.aliasHash, aliasHash)
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
