import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
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
import type { BackendUserDoesNotExistError } from '#common/types/backend/errors/backend-user-does-not-exist-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { CheckUserPasswordHashIsDefinedError } from '#common/types/backend/function-errors/check-user-password-hash-is-defined-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { GetMemberGivensForSelectionError } from '#common/types/backend/function-errors/get-member-givens-for-selection-error';
import type { GetSelectedGivensError } from '#common/types/backend/function-errors/get-selected-givens-error';
import type { GetUserByEmailCheckExistsError } from '#common/types/backend/function-errors/get-user-by-email-check-exists-error';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { MakeAliasError } from '#common/types/backend/function-errors/make-alias-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { SelectUnselectedGivensError } from '#common/types/backend/function-errors/select-unselected-givens-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
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

  async getSelectedGivensResult(item: {
    user: UserTab;
    projectId: string;
  }): Result.ResultAsync<SelectedGiven[], GetSelectedGivensError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        this.selectUnselectedGivensResult({
          user: v.user,
          projectId: v.projectId
        })
      ),
      Result.map(
        (v): SelectedGiven[] =>
          v.user.ui.projectSelectedGivenLinks?.find(
            link => link.projectId === v.projectId
          )?.givens ?? []
      )
    );
  }

  async selectUnselectedGivensResult(item: {
    user: UserTab;
    projectId: string;
  }): Result.ResultAsync<
    ProjectSelectedGivenLink[],
    SelectUnselectedGivensError
  > {
    let { user, projectId } = item;

    user.ui = user.ui ?? makeCopy(DEFAULT_SRV_UI);

    let existingLinks: ProjectSelectedGivenLink[] =
      user.ui.projectSelectedGivenLinks ?? [];

    let memberResult: Result.Result<MemberTab, MemberEntToTabError> =
      await this.db.drizzle.query.membersTable
        .findFirst({
          where: and(
            eq(membersTable.memberId, user.userId),
            eq(membersTable.projectId, projectId)
          )
        })
        .then(x =>
          isUndefined(x)
            ? Result.succeed(undefined)
            : this.tabService.memberEntToTabResult({ memberEnt: x })
        );

    if (Result.isFailure(memberResult)) {
      return memberResult;
    }

    let member: MemberTab = memberResult.value;

    if (isUndefined(member)) {
      return Result.succeed(user.ui.projectSelectedGivenLinks);
    }

    let memberGivensResult: Result.Result<
      MemberGiven[],
      GetMemberGivensForSelectionError
    > = await this.givensService.getMemberGivensForSelectionResult({
      projectId: member.projectId,
      roles: member.roles
    });

    if (Result.isFailure(memberGivensResult)) {
      return memberGivensResult;
    }

    let memberGivens: MemberGiven[] = memberGivensResult.value;

    let existingLink: ProjectSelectedGivenLink = existingLinks.find(
      link => link.projectId === member.projectId
    );

    let selectedGivens: SelectedGiven[] = existingLink?.givens ?? [];

    let givens: SelectedGiven[] = memberGivens.map(given => {
      let storedGiven: SelectedGiven = selectedGivens.find(
        selectedGiven => selectedGiven.givenId === given.givenId
      );

      let availableValues: string[] = given.memberGivenValues.map(
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

    let isExistingLink: boolean = isDefined(existingLink);

    user.ui.projectSelectedGivenLinks = isExistingLink
      ? existingLinks.map(link =>
          link.projectId === projectId ? projectSelectedGivenLink : link
        )
      : [...existingLinks, projectSelectedGivenLink];

    return Result.succeed(user.ui.projectSelectedGivenLinks);
  }

  checkUserPasswordHashIsDefinedResult(item: {
    user: UserTab;
  }): Result.Result<void, CheckUserPasswordHashIsDefinedError> {
    let { user } = item;

    return isUndefined(user.passwordHash)
      ? Result.fail({ code: 'BACKEND_SIGN_UP_TO_SET_PASSWORD' })
      : Result.succeed();
  }

  async getUserCheckExistsResult(item: {
    userId: string;
  }): Result.ResultAsync<UserTab, GetUserCheckExistsError> {
    let { userId } = item;

    return this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.userId, userId)
      })
      .then(x =>
        isUndefined(x)
          ? Result.fail({ code: 'BACKEND_USER_DOES_NOT_EXIST' })
          : this.tabService.userEntToTabResult({ userEnt: x })
      );
  }

  checkUserIsNotRestrictedResult(item: {
    user: UserTab;
  }): Result.Result<void, CheckUserIsNotRestrictedError> {
    let { user } = item;

    return user.alias === RESTRICTED_USER_ALIAS
      ? Result.fail({ code: 'BACKEND_RESTRICTED_USER' })
      : Result.succeed();
  }

  async getUserByEmailCheckExistsResult(item: {
    email: string;
  }): Result.ResultAsync<UserTab, GetUserByEmailCheckExistsError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'emailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.email,
            hashSecret: v.hashSecret
          })
      ),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          UserTab,
          UserEntToTabError | BackendUserDoesNotExistError
        > =>
          this.db.drizzle.query.usersTable
            .findFirst({ where: eq(usersTable.emailHash, v.emailHash) })
            .then(x =>
              isUndefined(x)
                ? Result.fail({ code: 'BACKEND_USER_DOES_NOT_EXIST' })
                : this.tabService.userEntToTabResult({ userEnt: x })
            )
      )
    );
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
    let result: Result.Result<string, MakeAliasError> =
      await this.makeAliasResult({ email: email });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let alias: string = result.value;

    return alias;
  }

  async makeAliasResult(item: {
    email: string;
  }): Result.ResultAsync<string, MakeAliasError> {
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
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.andThen(async (v): Result.ResultAsync<string, MakeHashError> => {
        let alias: string = v.alias;

        let count = 2;

        let isRestart = true;

        while (isRestart) {
          let aliasHashResult: Result.Result<string, MakeHashError> =
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
      })
    );
  }
}
