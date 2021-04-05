import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class EditMemberController {
  constructor(
    private dbService: DbService,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember)
  async editMember(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendEditMemberRequest)
    reqValid: apiToBackend.ToBackendEditMemberRequest
  ) {
    let {
      projectId,
      memberId,
      isAdmin,
      isEditor,
      isExplorer
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    if (memberId === user.user_id && isAdmin === false) {
      throw new common.ServerError({
        message:
          apiToBackend.ErEnum.BACKEND_ADMIN_CAN_NOT_CHANGE_HIS_ADMIN_STATUS
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    member.is_admin = common.booleanToEnum(isAdmin);
    member.is_editor = common.booleanToEnum(isEditor);
    member.is_explorer = common.booleanToEnum(isExplorer);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        members: [member]
      }
    });

    let payload: apiToBackend.ToBackendEditMemberResponsePayload = {
      member: wrapper.wrapToApiMember(member)
    };

    return payload;
  }
}