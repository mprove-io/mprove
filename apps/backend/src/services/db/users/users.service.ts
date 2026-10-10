import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import {
  type UserEnt,
  usersTable
} from '#backend/drizzle/postgres/schema/users';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { ServerError } from '#common/classes/server-error/server-error';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendUserAliasIsUndefinedError } from '#common/types/backend/errors/backend-user-alias-is-undefined-error';
import type { CheckUserIsNotRestrictedResultError } from '#common/types/backend/function-errors/check-user-is-not-restricted-result-error';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { MakeAliasResultError } from '#common/types/backend/function-errors/make-alias-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
import { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { ProjectSelectedGivenLink } from '#common/types/backend/parts/project-selected-given-link';
import type { User } from '#common/types/backend/parts/user';

@Injectable()
export class UsersService {
  constructor(
    private dconfigsService: DconfigsService,
    private givensService: GivensService,
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
      apiKeyPrefix: user.apiKeyPrefix,
      ui: {
        timezone: user.ui?.timezone || defaultSrvUi.timezone,
        timeSpec: user.ui?.timeSpec || defaultSrvUi.timeSpec,
        timeRangeFraction:
          user.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,
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
        projectExplorerSessionLinks: isDefined(
          user.ui?.projectExplorerSessionLinks
        )
          ? user.ui?.projectExplorerSessionLinks
          : defaultSrvUi.projectExplorerSessionLinks,
        //
        projectReportLinks: isDefined(user.ui?.projectReportLinks)
          ? user.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,
        //
        projectSelectedGivenLinks: isDefined(user.ui?.projectSelectedGivenLinks)
          ? user.ui?.projectSelectedGivenLinks
          : defaultSrvUi.projectSelectedGivenLinks,
        //
        chartsByModel: isDefined(user.ui?.chartsByModel)
          ? user.ui?.chartsByModel
          : defaultSrvUi.chartsByModel,
        //
        modelTreeLevels: isDefined(user.ui?.modelTreeLevels)
          ? user.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels,
        //
        permissionsAutoAcceptSessionIds: isDefined(
          user.ui?.permissionsAutoAcceptSessionIds
        )
          ? user.ui?.permissionsAutoAcceptSessionIds
          : defaultSrvUi.permissionsAutoAcceptSessionIds,
        //
        newSessionPermissionsAutoAccept: isDefined(
          user.ui?.newSessionPermissionsAutoAccept
        )
          ? user.ui?.newSessionPermissionsAutoAccept
          : defaultSrvUi.newSessionPermissionsAutoAccept,
        //
        newSessionExplorerModelExtraId: isDefined(
          user.ui?.newSessionExplorerModelExtraId
        )
          ? user.ui?.newSessionExplorerModelExtraId
          : defaultSrvUi.newSessionExplorerModelExtraId,
        //
        newSessionExplorerVariant: isDefined(user.ui?.newSessionExplorerVariant)
          ? user.ui?.newSessionExplorerVariant
          : defaultSrvUi.newSessionExplorerVariant,
        //
        newSessionEditorModelExtraId: isDefined(
          user.ui?.newSessionEditorModelExtraId
        )
          ? user.ui?.newSessionEditorModelExtraId
          : defaultSrvUi.newSessionEditorModelExtraId,
        //
        newSessionEditorVariant: isDefined(user.ui?.newSessionEditorVariant)
          ? user.ui?.newSessionEditorVariant
          : defaultSrvUi.newSessionEditorVariant
      },
      isCodexAuthSet: isDefined(user.codexAuth),
      codexAuthUpdateTs: user.codexAuthUpdateTs,
      codexAuthExpiresTs: user.codexAuthExpiresTs,
      serverTs: Number(user.serverTs)
    };

    return apiUser;
  }

  async getSelectedGivens(item: { user: UserTab; projectId: string }) {
    let { user, projectId } = item;

    await this.selectUnselectedGivens({ user: user, projectId: projectId });

    let projectSelectedGivenLink = user.ui.projectSelectedGivenLinks?.find(
      link => link.projectId === projectId
    );

    return projectSelectedGivenLink?.givens ?? [];
  }

  async selectUnselectedGivens(item: { user: UserTab; projectId: string }) {
    let { user, projectId } = item;

    user.ui = user.ui ?? makeCopy(DEFAULT_SRV_UI);

    let existingLinks = user.ui.projectSelectedGivenLinks ?? [];

    let member = await this.db.drizzle.query.membersTable
      .findFirst({
        where: and(
          eq(membersTable.memberId, user.userId),
          eq(membersTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.memberEntToTab(x));

    if (isUndefined(member)) {
      return user.ui.projectSelectedGivenLinks;
    }

    let memberGivens = await this.givensService.getMemberGivensForSelection({
      projectId: member.projectId,
      roles: member.roles
    });

    let existingLink = existingLinks.find(
      link => link.projectId === member.projectId
    );

    let selectedGivens = existingLink?.givens ?? [];

    let givens = memberGivens.map(given => {
      let storedGiven = selectedGivens.find(
        selectedGiven => selectedGiven.givenId === given.givenId
      );

      let availableValues = given.memberGivenValues.map(
        memberGivenValue => memberGivenValue.value
      );

      let values: string[];

      if (storedGiven === undefined) {
        values =
          given.isMultiple === true
            ? availableValues
            : availableValues.slice(0, 1);
      } else if (given.isMultiple !== true) {
        values = availableValues
          .filter(value => storedGiven.values.indexOf(value) > -1)
          .slice(0, 1);

        if (values.length === 0 && availableValues.length > 0) {
          values = availableValues.slice(0, 1);
        }
      } else {
        values = availableValues.filter(
          value => storedGiven.values.indexOf(value) > -1
        );
      }

      let normalizedGiven: SelectedGiven = {
        givenId: given.givenId,
        type: given.type,
        isMultiple: given.isMultiple,
        values: values
      };

      return normalizedGiven;
    });

    let projectSelectedGivenLink: ProjectSelectedGivenLink = {
      projectId: member.projectId,
      givens: givens,
      navTs: existingLink?.navTs ?? Date.now()
    };

    let hasExistingLink = isDefined(existingLink);

    user.ui.projectSelectedGivenLinks = hasExistingLink
      ? existingLinks.map(link =>
          link.projectId === projectId ? projectSelectedGivenLink : link
        )
      : [...existingLinks, projectSelectedGivenLink];

    return user.ui.projectSelectedGivenLinks;
  }

  checkUserPasswordHashIsDefined(item: { user: UserTab }) {
    let { user } = item;

    if (isUndefined(user.passwordHash)) {
      throw new ServerError({
        message: 'BACKEND_SIGN_UP_TO_SET_PASSWORD'
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
        message: 'BACKEND_USER_DOES_NOT_EXIST'
      });
    }

    return user;
  }

  checkUserIsNotRestricted(item: { user: UserTab }) {
    let result: Result.Result<void, CheckUserIsNotRestrictedResultError> =
      this.checkUserIsNotRestrictedResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  checkUserIsNotRestrictedResult(item: {
    user: UserTab;
  }): Result.Result<void, CheckUserIsNotRestrictedResultError> {
    let { user } = item;

    return user.alias === RESTRICTED_USER_ALIAS
      ? Result.fail({ code: 'BACKEND_RESTRICTED_USER' })
      : Result.succeed();
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
        message: 'BACKEND_USER_DOES_NOT_EXIST'
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
      apiKeyPrefix: undefined,
      codexAuthUpdateTs: undefined,
      codexAuthExpiresTs: undefined,
      keyTag: undefined,
      serverTs: undefined,
      createdTs: Date.now()
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
      apiKeyPrefix: undefined,
      codexAuthUpdateTs: undefined,
      codexAuthExpiresTs: undefined,
      keyTag: undefined,
      serverTs: undefined,
      createdTs: Date.now()
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

  async makeAlias(email: string): Promise<string> {
    let result: Result.Result<string, MakeAliasResultError> =
      await this.makeAliasResult({ email: email });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let alias: string = result.value;

    return alias;
  }

  async makeAliasResult(item: {
    email: string;
  }): Result.ResultAsync<string, MakeAliasResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'alias',
        (v): Result.Result<string, BackendUserAliasIsUndefinedError> => {
          let reg: RegExp = MyRegex.CAPTURE_ALIAS();

          let match: RegExpExecArray = reg.exec(v.email);

          let alias: string = match ? match[1] : undefined;

          return isUndefined(alias)
            ? Result.fail({ code: 'BACKEND_USER_ALIAS_IS_UNDEFINED' })
            : Result.succeed(alias);
        }
      ),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretResultError> =>
          this.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.andThen(
        async (v): Result.ResultAsync<string, MakeHashResultError> => {
          let alias: string = v.alias;

          let count = 2;

          let isRestart = true;

          while (isRestart) {
            let aliasHashResult: Result.Result<string, MakeHashResultError> =
              this.hashService.makeHashResult({
                input: alias,
                hashSecret: v.hashSecret
              });

            if (Result.isFailure(aliasHashResult)) {
              return Result.fail(aliasHashResult.error);
            }

            let aliasUserEnt: UserEnt =
              await this.db.drizzle.query.usersTable.findFirst({
                where: eq(usersTable.aliasHash, aliasHashResult.value)
              });

            if (isDefined(aliasUserEnt)) {
              alias = `${alias}${count}`;

              count++;
            } else {
              isRestart = false;
            }
          }

          return Result.succeed(alias);
        }
      )
    );
  }
}
