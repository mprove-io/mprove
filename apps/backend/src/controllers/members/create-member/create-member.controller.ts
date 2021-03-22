import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';

@Controller()
export class CreateMemberController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private avatarsRepository: repositories.AvatarsRepository,
    private branchesRepository: repositories.BranchesRepository,
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
        devRepoId: newMember.member_id
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
      branch_id: common.BRANCH_MASTER
    });

    let devBranch = maker.makeBranch({
      structId: prodBranch.struct_id,
      projectId: projectId,
      repoId: newMember.member_id,
      branchId: common.BRANCH_MASTER
    });

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.addRecords({
        manager: manager,
        records: {
          members: [newMember],
          users: common.isDefined(newUser) ? [newUser] : [],
          branches: [devBranch]
        }
      });
    });

    let avatar = await this.avatarsRepository.findOne({
      select: ['user_id', 'avatar_small'],
      where: {
        user_id: newMember.member_id
      }
    });

    let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');
    let link = `${hostUrl}/org/${project.org_id}/project/${projectId}/team`;

    await this.mailerService.sendMail({
      to: email,
      subject: `[Mprove] ${user.alias} added you to ${project.name} project team`,
      text: `Project url: ${link}`
    });

    let apiMember = wrapper.wrapToApiMember(records.members[0]);

    if (common.isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatar_small;
    }

    let payload: apiToBackend.ToBackendCreateMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
