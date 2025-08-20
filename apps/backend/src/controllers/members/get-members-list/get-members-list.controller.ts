import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetMembersListRequest,
  ToBackendGetMembersListResponsePayload
} from '~common/interfaces/to-backend/members/to-backend-get-members-list';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetMembersListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMembersList)
  async getMembersList(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetMembersListRequest = request.body;

    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.projectId, projectId)
    });

    let payload: ToBackendGetMembersListResponsePayload = {
      userMember: this.wrapToApiService.wrapToApiMember(userMember),
      membersList: members.map(x => this.wrapToApiService.wrapToApiEnvUser(x))
    };

    return payload;
  }
}
