import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateMemberRequestDto,
  ToBackendCreateMemberResponseDto
} from '#backend/controllers/members/create-member/create-member.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  AvatarTab,
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import {
  type UserEnt,
  usersTable
} from '#backend/drizzle/postgres/schema/users';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  BlockmlService,
  type RebuildStructResultValue
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { EmailService } from '#backend/services/email/email.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  EMPTY_REPORT_ID,
  EMPTY_STRUCT_ID,
  PATH_BRANCH,
  PATH_COMPLETE_REGISTRATION,
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORT,
  PATH_REPORTS,
  PROD_REPO_ID,
  PROJECT_ENV_PROD,
  RESTRICTED_USER_ALIAS
} from '#common/constants/top';
import {
  DEFAULT_SRV_UI,
  THROTTLE_MULTIPLIER
} from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendRestrictedUserError } from '#common/types/backend/errors/backend-restricted-user-error';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { MakeAliasResultError } from '#common/types/backend/function-errors/make-alias-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
import type { RebuildStructResultError } from '#common/types/backend/function-errors/rebuild-struct-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { UserEntToTabResultError } from '#common/types/backend/function-errors/user-ent-to-tab-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateMemberOutput } from '#common/types/backend/routes/members/create-member/create-member-output';
import type { ToDiskCreateDevRepoOutput } from '#common/types/disk/routes/repos/create-dev-repo/create-dev-repo-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle({
  '1s': {
    limit: 3 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 5 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 20 * THROTTLE_MULTIPLIER,
    blockDuration: seconds(60)
  },
  '600s': {
    limit: 100 * THROTTLE_MULTIPLIER,
    blockDuration: seconds(1 * 60 * 60)
  },
  '1h': {
    limit: 200 * THROTTLE_MULTIPLIER,
    blockDuration: seconds(24 * 60 * 60)
  }
})
@Controller()
export class CreateMemberController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private rpcService: RpcService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private blockmlService: BlockmlService,
    private usersService: UsersService,
    private membersService: MembersService,
    private emailService: EmailService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateMember' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateMember',
    description: 'Add a user to a project as a member'
  })
  @ApiOkResponse({
    type: ToBackendCreateMemberResponseDto
  })
  async createMember(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateMemberRequestDto
  ): Promise<BackendResultForOperation<'createMember'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        projectId: body.input.projectId,
        email: body.input.email,
        user: user
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.user.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretResultError> =>
          this.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'emailHash',
        (v): Result.Result<string, MakeHashResultError> =>
          this.hashService.makeHashResult({
            input: v.email,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'invitedUser',
        (v): Result.ResultAsync<UserTab, UserEntToTabResultError> =>
          this.db.drizzle.query.usersTable
            .findFirst({ where: eq(usersTable.emailHash, v.emailHash) })
            .then((userEnt: UserEnt) =>
              isUndefined(userEnt)
                ? Result.succeed(undefined)
                : this.tabService.userEntToTabResult({ userEnt: userEnt })
            )
      ),
      Result.bind(
        'newUser',
        async (
          v
        ): Result.ResultAsync<
          UserTab,
          MakeAliasResultError | BackendRestrictedUserError
        > => {
          if (isDefined(v.invitedUser)) {
            return Result.succeed(undefined);
          }

          let aliasResult: Result.Result<string, MakeAliasResultError> =
            await this.usersService.makeAliasResult({ email: v.email });

          if (Result.isFailure(aliasResult)) {
            return Result.fail(aliasResult.error);
          }

          let alias: string = aliasResult.value;

          if (alias === RESTRICTED_USER_ALIAS) {
            return Result.fail({ code: 'BACKEND_RESTRICTED_USER' });
          }

          let emailVerificationToken: string = makeId();

          let newUser: UserTab = {
            userId: makeId(),
            email: v.email,
            passwordResetToken: undefined,
            passwordResetExpiresTs: undefined,
            isEmailVerified: false,
            emailVerificationToken: emailVerificationToken,
            passwordHash: undefined,
            passwordSalt: undefined,
            jwtMinIat: undefined,
            alias: alias,
            firstName: undefined,
            lastName: undefined,
            ui: makeCopy(DEFAULT_SRV_UI),
            emailHash: undefined, // tab-to-ent
            aliasHash: undefined, // tab-to-ent
            passwordResetTokenHash: undefined, // tab-to-ent
            emailVerificationTokenHash: undefined, // tab-to-ent
            apiKeyPrefix: undefined,
            codexAuthUpdateTs: undefined,
            codexAuthExpiresTs: undefined,
            keyTag: undefined,
            serverTs: undefined,
            createdTs: undefined
          };

          return Result.succeed(newUser);
        }
      ),
      Result.andThrough(v =>
        isUndefined(v.invitedUser)
          ? Result.succeed()
          : this.membersService.checkMemberDoesNotExistResult({
              memberId: v.invitedUser.userId,
              projectId: v.projectId
            })
      ),
      Result.bind(
        'newMember',
        (v): Result.Result<MemberTab, never> =>
          Result.succeed(
            this.membersService.makeMember({
              projectId: v.projectId,
              user: isDefined(v.invitedUser) ? v.invitedUser : v.newUser,
              isAdmin: false,
              isEditor: true,
              isExplorer: true
            })
          )
      ),
      Result.bind(
        'diskCreateDevRepoOutput',
        (
          v
        ): Result.ResultAsync<
          ToDiskCreateDevRepoOutput,
          SendToDiskResultError
        > =>
          this.rpcService.sendToDiskResult({
            request: {
              operation: 'createDevRepo',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                devRepoId: v.newMember.memberId
              }
            }
          })
      ),
      Result.bind(
        'prodBranchEnt',
        (v): Result.ResultAsync<BranchEnt, never> =>
          this.db.drizzle.query.branchesTable
            .findFirst({
              where: and(
                eq(branchesTable.projectId, v.projectId),
                eq(branchesTable.repoId, PROD_REPO_ID),
                eq(branchesTable.branchId, v.project.defaultBranch)
              )
            })
            .then(prodBranchEnt => Result.succeed(prodBranchEnt))
      ),
      Result.bind(
        'devBranch',
        (v): Result.Result<BranchTab, never> =>
          Result.succeed(
            this.branchesService.makeBranch({
              projectId: v.projectId,
              repoId: v.newMember.memberId,
              branchId: v.project.defaultBranch
            })
          )
      ),
      Result.bind(
        'prodBranchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.prodBranchEnt.projectId),
                eq(bridgesTable.repoId, v.prodBranchEnt.repoId),
                eq(bridgesTable.branchId, v.prodBranchEnt.branchId)
              )
            })
            .then(bridgeEnts => Result.succeed(bridgeEnts))
      ),
      Result.bind(
        'devBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.prodBranchBridgeEnts.map(bridgeEnt =>
              this.bridgesService.makeBridge({
                projectId: v.devBranch.projectId,
                repoId: v.devBranch.repoId,
                branchId: v.devBranch.branchId,
                envId: bridgeEnt.envId,
                structId: EMPTY_STRUCT_ID,
                needValidate: true
              })
            )
          )
      ),
      Result.andThrough(v =>
        Result.sequence(v.devBranchBridges, async x => {
          if (x.envId === PROJECT_ENV_PROD) {
            let structId: string = makeId();

            let rebuildResult: Result.Result<
              RebuildStructResultValue,
              RebuildStructResultError
            > = await this.blockmlService.rebuildStructResult({
              traceId: v.traceId,
              orgId: v.project.orgId,
              projectId: v.projectId,
              repoId: v.newMember.memberId,
              structId: structId,
              diskFiles: v.diskCreateDevRepoOutput.files,
              mproveDir: v.diskCreateDevRepoOutput.mproveDir,
              envId: x.envId,
              selectedGivens: [],
              overrideTimezone: undefined
            });

            if (Result.isFailure(rebuildResult)) {
              return Result.fail(rebuildResult.error);
            }

            x.structId = structId;
            x.needValidate = false;
          } else {
            x.structId = EMPTY_STRUCT_ID;
            x.needValidate = true;
          }

          return Result.succeed();
        })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insert: {
                        members: [v.newMember],
                        users: isDefined(v.newUser) ? [v.newUser] : [],
                        branches: [v.devBranch],
                        bridges: [...v.devBranchBridges]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'avatars',
        (v): Result.ResultAsync<AvatarTab[], AvatarEntToTabResultError> =>
          this.db.drizzle
            .select({
              keyTag: avatarsTable.keyTag,
              userId: avatarsTable.userId,
              st: avatarsTable.st
              // lt: {},
            })
            .from(avatarsTable)
            .where(eq(avatarsTable.userId, v.newMember.memberId))
            .then(avatarEnts =>
              Result.sequence(avatarEnts, avatarEnt =>
                this.tabService.avatarEntToTabResult({
                  avatarEnt: avatarEnt as AvatarEnt
                })
              )
            )
      ),
      Result.andThrough(async v => {
        let hostUrl: string = this.cs
          .get<BackendConfig['hostUrl']>('hostUrl')
          .split(',')[0];

        if (
          isDefined(v.invitedUser) &&
          v.invitedUser.isEmailVerified === true
        ) {
          let urlProjectMetrics: string = [
            hostUrl,
            PATH_ORG,
            v.project.orgId,
            PATH_PROJECT,
            v.projectId,
            PATH_REPO,
            PROD_REPO_ID,
            PATH_BRANCH,
            v.project.defaultBranch,
            PATH_ENV,
            PROJECT_ENV_PROD,
            PATH_REPORTS,
            PATH_REPORT,
            EMPTY_REPORT_ID
          ].join('/');

          await this.emailService.sendInviteToVerifiedUser({
            email: v.email,
            user: v.user,
            project: v.project,
            urlProjectMetrics: urlProjectMetrics
          });
        } else {
          let emailVerificationToken = isDefined(v.invitedUser)
            ? v.invitedUser.emailVerificationToken
            : v.newUser.emailVerificationToken;

          let emailBase64: string = Buffer.from(v.email).toString('base64');

          let urlCompleteRegistration = `${hostUrl}/${PATH_COMPLETE_REGISTRATION}?token=${emailVerificationToken}&b=${emailBase64}`;

          await this.emailService.sendInviteToUnverifiedUser({
            email: v.email,
            user: v.user,
            project: v.project,
            urlCompleteRegistration: urlCompleteRegistration
          });
        }

        return Result.succeed();
      }),
      Result.bind('apiMember', (v): Result.Result<Member, never> => {
        let avatar: AvatarTab = v.avatars.length > 0 ? v.avatars[0] : undefined;

        let apiMember: Member = this.membersService.tabToApi({
          member: v.newMember
        });

        if (isDefined(avatar)) {
          apiMember.avatarSmall = avatar.avatarSmall;
        }

        return Result.succeed(apiMember);
      }),
      Result.map((v): ToBackendCreateMemberOutput => ({ member: v.apiMember }))
    );
  }
}
