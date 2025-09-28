import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, seconds } from '@nestjs/throttler';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import {
  BridgeEnt,
  bridgesTable
} from '~backend/drizzle/postgres/schema/bridges';
import { UserEnt, usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { EmailService } from '~backend/services/email.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
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
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendCreateMemberRequest,
  ToBackendCreateMemberResponsePayload
} from '~common/interfaces/to-backend/members/to-backend-create-member';
import {
  ToDiskCreateDevRepoRequest,
  ToDiskCreateDevRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-create-dev-repo';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle({
  '1s': {
    limit: 3 * 2
  },
  '5s': {
    limit: 5 * 2
  },
  '60s': {
    limit: 20 * 2,
    blockDuration: seconds(60)
  },
  '600s': {
    limit: 100 * 2,
    blockDuration: seconds(12 * 60 * 60) // 24h
  }
})
@Controller()
export class CreateMemberController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private usersService: UsersService,
    private membersService: MembersService,
    private emailService: EmailService,
    private wrapToApiService: WrapToApiService,
    private makerService: MakerService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateMember)
  async createMember(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCreateMemberRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, email } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let invitedUser = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.email, email)
    });

    let newUser: UserEnt;

    if (isUndefined(invitedUser)) {
      let alias = await this.usersService.makeAlias(email);

      newUser = {
        userId: makeId(),
        email: email,
        passwordResetToken: undefined,
        passwordResetExpiresTs: undefined,
        isEmailVerified: false,
        emailVerificationToken: makeId(),
        hash: undefined,
        salt: undefined,
        jwtMinIat: undefined,
        alias: alias,
        firstName: undefined,
        lastName: undefined,
        ui: makeCopy(DEFAULT_SRV_UI),
        serverTs: undefined
      };

      // newUser = maker.makeUser({
      //   email: email,
      //   isEmailVerified: false,
      //   alias: alias
      // });
    }

    if (isDefined(invitedUser)) {
      await this.membersService.checkMemberDoesNotExist({
        memberId: invitedUser.userId,
        projectId: projectId
      });
    }

    let newMember = this.makerService.makeMember({
      projectId: projectId,
      user: isDefined(invitedUser) ? invitedUser : newUser,
      isAdmin: false,
      isEditor: true,
      isExplorer: true
    });

    let toDiskCreateDevRepoRequest: ToDiskCreateDevRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        devRepoId: newMember.memberId,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskCreateDevRepoResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskCreateDevRepoRequest,
        checkIsOk: true
      });

    let prodBranch = await this.db.drizzle.query.branchesTable.findFirst({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, PROD_REPO_ID),
        eq(branchesTable.branchId, project.defaultBranch)
      )
    });

    let devBranch = this.makerService.makeBranch({
      projectId: projectId,
      repoId: newMember.memberId,
      branchId: project.defaultBranch
    });

    let prodBranchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, prodBranch.projectId),
        eq(bridgesTable.repoId, prodBranch.repoId),
        eq(bridgesTable.branchId, prodBranch.branchId)
      )
    });

    let devBranchBridges: BridgeEnt[] = [];

    prodBranchBridges.forEach(x => {
      let devBranchBridge = this.makerService.makeBridge({
        projectId: devBranch.projectId,
        repoId: devBranch.repoId,
        branchId: devBranch.branchId,
        envId: x.envId,
        structId: EMPTY_STRUCT_ID,
        needValidate: true
      });

      devBranchBridges.push(devBranchBridge);
    });

    await forEachSeries(devBranchBridges, async x => {
      if (x.envId === PROJECT_ENV_PROD) {
        let structId = makeId();

        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          projectId: projectId,
          structId: structId,
          diskFiles: diskResponse.payload.files,
          mproveDir: diskResponse.payload.mproveDir,
          envId: x.envId,
          overrideTimezone: undefined
        });

        x.structId = structId;
        x.needValidate = false;
      } else {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                members: [newMember],
                users: isDefined(newUser) ? [newUser] : [],
                branches: [devBranch],
                bridges: [...devBranchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let avatars = await this.db.drizzle
      .select({
        userId: avatarsTable.userId,
        avatarSmall: avatarsTable.avatarSmall
      })
      .from(avatarsTable)
      .where(eq(avatarsTable.userId, newMember.memberId));

    let avatar = avatars.length > 0 ? avatars[0] : undefined;

    let hostUrl = this.cs.get<BackendConfig['hostUrl']>('hostUrl');

    if (isDefined(invitedUser) && invitedUser.isEmailVerified === true) {
      let urlProjectMetrics = [
        hostUrl,
        PATH_ORG,
        project.orgId,
        PATH_PROJECT,
        projectId,
        PATH_REPO,
        PROD_REPO_ID,
        PATH_BRANCH,
        project.defaultBranch,
        PATH_ENV,
        PROJECT_ENV_PROD,
        PATH_REPORTS,
        PATH_REPORT,
        EMPTY_REPORT_ID
      ].join('/');

      await this.emailService.sendInviteToVerifiedUser({
        email: email,
        user: user,
        project: project,
        urlProjectMetrics: urlProjectMetrics
      });
    } else {
      let emailVerificationToken = isDefined(invitedUser)
        ? invitedUser.emailVerificationToken
        : newUser.emailVerificationToken;

      let emailBase64 = Buffer.from(email).toString('base64');

      let urlCompleteRegistration = `${hostUrl}/${PATH_COMPLETE_REGISTRATION}?token=${emailVerificationToken}&b=${emailBase64}`;

      await this.emailService.sendInviteToUnverifiedUser({
        email: email,
        user: user,
        project: project,
        urlCompleteRegistration: urlCompleteRegistration
      });
    }

    let apiMember = this.wrapToApiService.wrapToApiMember(newMember);

    if (isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatarSmall;
    }

    let payload: ToBackendCreateMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
