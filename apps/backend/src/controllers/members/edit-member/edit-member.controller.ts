import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';

@Controller()
export class EditMemberController {
  constructor(
    private connection: Connection,
    private rabbitService: RabbitService,
    private avatarsRepository: repositories.AvatarsRepository,
    private branchesRepository: repositories.BranchesRepository,
    private usersRepository: repositories.UsersRepository,
    private membersRepository: repositories.MembersRepository,
    private projectsService: ProjectsService,
    private usersService: UsersService,
    private membersService: MembersService,
    private mailerService: MailerService,
    private cs: ConfigService<interfaces.Config>
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

    await this.membersService.checkMemberExists({
      memberId: memberId,
      projectId: projectId
    });

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    member.is_admin = common.booleanToEnum(isAdmin);
    member.is_editor = common.booleanToEnum(isEditor);
    member.is_explorer = common.booleanToEnum(isExplorer);

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          members: [member]
        }
      });
    });

    let payload: apiToBackend.ToBackendEditMemberResponsePayload = {
      member: wrapper.wrapToApiMember(member)
    };

    return payload;
  }
}
