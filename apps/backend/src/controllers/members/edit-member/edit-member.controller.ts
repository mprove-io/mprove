import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { AvatarsRepository } from '~backend/models/store-repositories/_index';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class EditMemberController {
  constructor(
    private dbService: DbService,
    private projectsService: ProjectsService,
    private avatarsRepository: AvatarsRepository,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember)
  async editMember(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendEditMemberRequest = request.body;

    let { projectId, memberId, isAdmin, isEditor, isExplorer, roles, envs } =
      reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    if (memberId === user.user_id && isAdmin === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ADMIN_CAN_NOT_CHANGE_HIS_ADMIN_STATUS
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    member.is_admin = common.booleanToEnum(isAdmin);
    member.is_editor = common.booleanToEnum(isEditor);
    member.is_explorer = common.booleanToEnum(isExplorer);
    member.roles = roles;
    member.envs = envs;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        members: [member]
      }
    });

    let avatar = await this.avatarsRepository.findOne({
      select: ['user_id', 'avatar_small'],
      where: {
        user_id: member.member_id
      }
    });

    let apiMember = wrapper.wrapToApiMember(member);

    if (common.isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatar_small;
    }

    let payload: apiToBackend.ToBackendEditMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
