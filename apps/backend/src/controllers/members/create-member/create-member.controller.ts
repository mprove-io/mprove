import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
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
    private usersRepository: repositories.UsersRepository,
    private projectsService: ProjectsService,
    private usersService: UsersService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateMember)
  async createMember(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateMemberRequest)
    reqValid: apiToBackend.ToBackendCreateMemberRequest
  ) {
    let { projectId, email } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
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

    let apiMember = wrapper.wrapToApiMember(newMember);

    let avatar = await this.avatarsRepository.findOne({
      select: ['user_id', 'avatar_small'],
      where: {
        user_id: newMember.member_id
      }
    });

    apiMember.avatarSmall = avatar.avatar_small;

    let newUsers = [];

    if (common.isDefined(newUser)) {
      newUsers.push(newUsers);
    }

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          members: [newMember],
          users: newUsers
          // structs: [struct],
          // branches: [prodBranch, devBranch],
          // vizs: vizs.map(x => wrapper.wrapToEntityViz(x)),
          // queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
          // models: models.map(x => wrapper.wrapToEntityModel(x)),
          // mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          // dashboards: dashboards.map(x => wrapper.wrapToEntityDashboard(x))
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
