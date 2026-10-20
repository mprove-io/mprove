import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateMemberRequestDto,
  ToBackendCreateMemberResponseDto
} from '#backend/controllers/members/create-member/create-member.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
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
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
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
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { DbBranchesFindFirstError } from '#common/types/backend/function-errors/db/branches/db-branches-find-first-error';
import type { DbBridgesFindManyError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { DbUsersFindFirstError } from '#common/types/backend/function-errors/db/users/db-users-find-first-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeAliasError } from '#common/types/backend/function-errors/make-alias-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
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
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private blockmlService: BlockmlService,
    private usersService: UsersService,
    private membersService: MembersService,
    private emailService: EmailService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
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
        (
          v
        ): Result.ResultAsync<
          ProjectTab,
          DbProjectsFindFirstCheckExistsError
        > =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'emailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHash({
            input: v.email,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'invitedUser',
        (v): Result.ResultAsync<UserTab, DbUsersFindFirstError> =>
          this.db.users.findFirst({
            where: eq(usersTable.emailHash, v.emailHash)
          })
      ),
      Result.bind(
        'newUser',
        async (
          v
        ): Result.ResultAsync<
          UserTab,
          MakeAliasError | BackendRestrictedUserError
        > => {
          if (isDefined(v.invitedUser)) {
            return Result.succeed(undefined);
          }

          let aliasResult: Result.Result<string, MakeAliasError> =
            await this.usersService.makeAlias({ email: v.email });

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
          : this.membersService.checkMemberDoesNotExist({
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
        (v): Result.ResultAsync<ToDiskCreateDevRepoOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
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
        'prodBranch',
        (v): Result.ResultAsync<BranchTab, DbBranchesFindFirstError> =>
          this.db.branches.findFirst({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, PROD_REPO_ID),
              eq(branchesTable.branchId, v.project.defaultBranch)
            )
          })
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
        'prodBranchBridges',
        (v): Result.ResultAsync<BridgeTab[], DbBridgesFindManyError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.prodBranch.projectId),
              eq(bridgesTable.repoId, v.prodBranch.repoId),
              eq(bridgesTable.branchId, v.prodBranch.branchId)
            )
          })
      ),
      Result.bind(
        'devBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.prodBranchBridges.map(bridge =>
              this.bridgesService.makeBridge({
                projectId: v.devBranch.projectId,
                repoId: v.devBranch.repoId,
                branchId: v.devBranch.branchId,
                envId: bridge.envId,
                structId: EMPTY_STRUCT_ID,
                needValidate: true
              })
            )
          )
      ),
      Result.andThrough(v =>
        this.blockmlService.rebuildBranchBridges({
          branchBridges: v.devBranchBridges,
          envId: PROJECT_ENV_PROD,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.newMember.memberId,
          diskFiles: v.diskCreateDevRepoOutput.files,
          mproveDir: v.diskCreateDevRepoOutput.mproveDir
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insert: {
            members: [v.newMember],
            users: isDefined(v.newUser) ? [v.newUser] : [],
            branches: [v.devBranch],
            bridges: [...v.devBranchBridges]
          }
        })
      ),
      Result.bind(
        'avatars',
        (v): Result.ResultAsync<AvatarTab[], AvatarEntToTabError> =>
          this.db.drizzle
            .select({
              keyTag: avatarsTable.keyTag,
              userId: avatarsTable.userId,
              st: avatarsTable.st
              // lt: {},
            })
            .from(avatarsTable)
            .where(eq(avatarsTable.userId, v.newMember.memberId))
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.avatarEntToTab({
                  avatarEnt: x as AvatarEnt
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
