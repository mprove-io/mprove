import { MailerService } from '@nestjs-modules/mailer';
import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateMemberController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private usersService: UsersService,
    private membersService: MembersService,
    private mailerService: MailerService,
    private wrapToApiService: WrapToApiService,
    private makerService: MakerService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember)
  async createMember(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateMemberRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, email } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let invitedUser = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.email, email)
    });

    // let invitedUser = await this.usersRepository.findOne({
    //   where: { email: email }
    // });

    let newUser: schemaPostgres.UserEnt;

    if (common.isUndefined(invitedUser)) {
      let alias = await this.usersService.makeAlias(email);

      newUser = {
        userId: common.makeId(),
        email: email,
        passwordResetToken: undefined,
        passwordResetExpiresTs: undefined,
        isEmailVerified: false,
        emailVerificationToken: common.makeId(),
        hash: undefined,
        salt: undefined,
        jwtMinIat: undefined,
        alias: alias,
        firstName: undefined,
        lastName: undefined,
        timezone: common.USE_PROJECT_TIMEZONE_VALUE,
        ui: constants.DEFAULT_UI,
        serverTs: undefined
      };

      // newUser = maker.makeUser({
      //   email: email,
      //   isEmailVerified: false,
      //   alias: alias
      // });
    }

    if (common.isDefined(invitedUser)) {
      await this.membersService.checkMemberDoesNotExist({
        memberId: invitedUser.userId,
        projectId: projectId
      });
    }

    let newMember = this.makerService.makeMember({
      projectId: projectId,
      user: common.isDefined(invitedUser) ? invitedUser : newUser,
      isAdmin: false,
      isEditor: true,
      isExplorer: true
    });

    let toDiskCreateDevRepoRequest: apiToDisk.ToDiskCreateDevRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
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
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateDevRepoResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.orgId,
            projectId: projectId
          }),
          message: toDiskCreateDevRepoRequest,
          checkIsOk: true
        }
      );

    let prodBranch = await this.db.drizzle.query.branchesTable.findFirst({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, common.PROD_REPO_ID),
        eq(branchesTable.branchId, project.defaultBranch)
      )
    });

    // let prodBranch = await this.branchesRepository.findOne({
    //   where: {
    //     project_id: projectId,
    //     repo_id: common.PROD_REPO_ID,
    //     branch_id: project.default_branch
    //   }
    // });

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

    // let prodBranchBridges = await this.bridgesRepository.find({
    //   where: {
    //     project_id: prodBranch.project_id,
    //     repo_id: prodBranch.repo_id,
    //     branch_id: prodBranch.branch_id
    //   }
    // });

    let devBranchBridges: schemaPostgres.BridgeEnt[] = [];

    prodBranchBridges.forEach(x => {
      let devBranchBridge = this.makerService.makeBridge({
        projectId: devBranch.projectId,
        repoId: devBranch.repoId,
        branchId: devBranch.branchId,
        envId: x.envId,
        structId: common.EMPTY_STRUCT_ID,
        needValidate: true
      });

      devBranchBridges.push(devBranchBridge);
    });

    await forEachSeries(devBranchBridges, async x => {
      if (x.envId === common.PROJECT_ENV_PROD) {
        let structId = common.makeId();

        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          orgId: project.orgId,
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
        x.structId = common.EMPTY_STRUCT_ID;
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
                users: common.isDefined(newUser) ? [newUser] : [],
                branches: [devBranch],
                bridges: [...devBranchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     members: [newMember],
    //     users: common.isDefined(newUser) ? [newUser] : [],
    //     branches: [devBranch],
    //     bridges: [...devBranchBridges]
    //   }
    // });

    let avatars = await this.db.drizzle
      .select({
        userId: avatarsTable.userId,
        avatarSmall: avatarsTable.avatarSmall
      })
      .from(avatarsTable)
      .where(eq(avatarsTable.userId, newMember.memberId));

    let avatar = avatars.length > 0 ? avatars[0] : undefined;

    // let avatar = await this.avatarsRepository.findOne({
    //   select: ['user_id', 'avatar_small'],
    //   where: {
    //     user_id: newMember.member_id
    //   }
    // });

    let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');

    if (common.isDefined(invitedUser) && invitedUser.isEmailVerified === true) {
      let urlProjectMetrics = [
        hostUrl,
        common.PATH_ORG,
        project.orgId,
        common.PATH_PROJECT,
        projectId,
        common.PATH_REPO,
        common.PROD_REPO_ID,
        common.PATH_BRANCH,
        project.defaultBranch,
        common.PATH_ENV,
        common.PROJECT_ENV_PROD,
        common.PATH_METRICS,
        common.PATH_REPORT,
        common.EMPTY_REPORT_ID
      ].join('/');

      await this.mailerService.sendMail({
        to: email,
        subject: `[Mprove] ${user.alias} added you to ${project.name} project team`,
        text: `Project metrics: ${urlProjectMetrics}`
      });
    } else {
      let emailVerificationToken = common.isDefined(invitedUser)
        ? invitedUser.emailVerificationToken
        : newUser.emailVerificationToken;

      let emailBase64 = Buffer.from(email).toString('base64');

      let urlCompleteRegistration = `${hostUrl}/${common.PATH_COMPLETE_REGISTRATION}?token=${emailVerificationToken}&b=${emailBase64}`;

      await this.mailerService.sendMail({
        to: email,
        subject: `[Mprove] ${user.alias} invited you to ${project.name} project team`,
        text: `Click the link to complete registration: ${urlCompleteRegistration}`
      });
    }

    let apiMember = this.wrapToApiService.wrapToApiMember(newMember);

    if (common.isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatarSmall;
    }

    let payload: apiToBackend.ToBackendCreateMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
