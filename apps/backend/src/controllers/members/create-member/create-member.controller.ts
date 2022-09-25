import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';
import { constants } from '~common/barrels/constants';

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
    private usersService: UsersService,
    private membersService: MembersService,
    private mailerService: MailerService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember)
  async createMember(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateMemberRequest)
    reqValid: apiToBackend.ToBackendCreateMemberRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, email } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    let invitedUser = await this.usersRepository.findOne({ email: email });

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

    await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateDevRepoResponse>({
      routingKey: helper.makeRoutingKeyToDisk({
        orgId: project.org_id,
        projectId: projectId
      }),
      message: toDiskCreateDevRepoRequest,
      checkIsOk: true
    });

    let prodBranch = await this.branchesRepository.findOne({
      project_id: projectId,
      repo_id: common.PROD_REPO_ID,
      branch_id: project.default_branch
    });

    let devBranch = maker.makeBranch({
      projectId: projectId,
      repoId: newMember.member_id,
      branchId: project.default_branch
    });

    let prodBranchBridges = await this.bridgesRepository.find({
      project_id: prodBranch.project_id,
      repo_id: prodBranch.repo_id,
      branch_id: prodBranch.branch_id
    });

    let devBranchBridges: entities.BridgeEntity[] = [];

    prodBranchBridges.forEach(x => {
      let devBranchBridge = maker.makeBridge({
        projectId: devBranch.project_id,
        repoId: devBranch.repo_id,
        branchId: devBranch.branch_id,
        envId: x.env_id,
        structId: x.struct_id,
        needValidate: x.need_validate
      });

      devBranchBridges.push(devBranchBridge);
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
        constants.PATH_ORG,
        project.org_id,
        constants.PATH_PROJECT,
        projectId,
        constants.PATH_REPO,
        constants.PROD_REPO_ID,
        constants.PATH_BRANCH,
        project.default_branch,
        constants.PATH_ENV,
        common.PROJECT_ENV_PROD,
        constants.PATH_VISUALIZATIONS
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
