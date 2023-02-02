import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateMemberController {
  constructor(
    private dbService: DbService,
    private rabbitService: RabbitService,
    private avatarsRepository: repositories.AvatarsRepository,
    private branchesRepository: repositories.BranchesRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private usersRepository: repositories.UsersRepository,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private usersService: UsersService,
    private membersService: MembersService,
    private mailerService: MailerService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember)
  async createMember(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateMemberRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, email } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    let invitedUser = await this.usersRepository.findOne({
      where: { email: email }
    });

    let newUser;

    if (common.isUndefined(invitedUser)) {
      let alias = await this.usersService.makeAlias(email);

      newUser = maker.makeUser({
        email: email,
        isEmailVerified: common.BoolEnum.FALSE,
        alias: alias
      });
    }

    if (common.isDefined(invitedUser)) {
      await this.membersService.checkMemberDoesNotExist({
        memberId: invitedUser.user_id,
        projectId: projectId
      });
    }

    let newMember = maker.makeMember({
      projectId: projectId,
      user: common.isDefined(invitedUser) ? invitedUser : newUser,
      isAdmin: common.BoolEnum.FALSE,
      isEditor: common.BoolEnum.TRUE,
      isExplorer: common.BoolEnum.TRUE
    });

    let toDiskCreateDevRepoRequest: apiToDisk.ToDiskCreateDevRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        devRepoId: newMember.member_id,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateDevRepoResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.org_id,
            projectId: projectId
          }),
          message: toDiskCreateDevRepoRequest,
          checkIsOk: true
        }
      );

    let prodBranch = await this.branchesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: common.PROD_REPO_ID,
        branch_id: project.default_branch
      }
    });

    let devBranch = maker.makeBranch({
      projectId: projectId,
      repoId: newMember.member_id,
      branchId: project.default_branch
    });

    let prodBranchBridges = await this.bridgesRepository.find({
      where: {
        project_id: prodBranch.project_id,
        repo_id: prodBranch.repo_id,
        branch_id: prodBranch.branch_id
      }
    });

    let devBranchBridges: entities.BridgeEntity[] = [];

    prodBranchBridges.forEach(x => {
      let devBranchBridge = maker.makeBridge({
        projectId: devBranch.project_id,
        repoId: devBranch.repo_id,
        branchId: devBranch.branch_id,
        envId: x.env_id,
        structId: common.EMPTY_STRUCT_ID,
        needValidate: common.BoolEnum.TRUE
      });

      devBranchBridges.push(devBranchBridge);
    });

    await forEachSeries(devBranchBridges, async x => {
      if (x.env_id === common.PROJECT_ENV_PROD) {
        let structId = common.makeId();

        await this.blockmlService.rebuildStruct({
          traceId,
          orgId: project.org_id,
          projectId,
          structId,
          diskFiles: diskResponse.payload.files,
          mproveDir: diskResponse.payload.mproveDir,
          envId: x.env_id
        });

        x.struct_id = structId;
        x.need_validate = common.BoolEnum.FALSE;
      } else {
        x.need_validate = common.BoolEnum.TRUE;
      }
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        members: [newMember],
        users: common.isDefined(newUser) ? [newUser] : [],
        branches: [devBranch],
        bridges: [...devBranchBridges]
      }
    });

    let avatar = await this.avatarsRepository.findOne({
      select: ['user_id', 'avatar_small'],
      where: {
        user_id: newMember.member_id
      }
    });

    let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');

    if (
      common.isDefined(invitedUser) &&
      invitedUser.is_email_verified === common.BoolEnum.TRUE
    ) {
      let urlProjectVizs = [
        hostUrl,
        common.PATH_ORG,
        project.org_id,
        common.PATH_PROJECT,
        projectId,
        common.PATH_REPO,
        common.PROD_REPO_ID,
        common.PATH_BRANCH,
        project.default_branch,
        common.PATH_ENV,
        common.PROJECT_ENV_PROD,
        common.PATH_METRICS,
        common.PATH_REPORT,
        common.EMPTY
      ].join('/');

      await this.mailerService.sendMail({
        to: email,
        subject: `[Mprove] ${user.alias} added you to ${project.name} project team`,
        text: `Project visualizations: ${urlProjectVizs}`
      });
    } else {
      let emailVerificationToken = common.isDefined(invitedUser)
        ? invitedUser.email_verification_token
        : newUser.email_verification_token;

      let emailBase64 = Buffer.from(email).toString('base64');

      let urlCompleteRegistration = `${hostUrl}/${common.PATH_COMPLETE_REGISTRATION}?token=${emailVerificationToken}&b=${emailBase64}`;

      await this.mailerService.sendMail({
        to: email,
        subject: `[Mprove] ${user.alias} invited you to ${project.name} project team`,
        text: `Click the link to complete registration: ${urlCompleteRegistration}`
      });
    }

    let apiMember = wrapper.wrapToApiMember(newMember);

    if (common.isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatar_small;
    }

    let payload: apiToBackend.ToBackendCreateMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
