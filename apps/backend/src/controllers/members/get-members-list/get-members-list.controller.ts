import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetMembersListRequest,
  ToBackendGetMembersListResponsePayload
} from '~common/interfaces/to-backend/members/to-backend-get-members-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetMembersListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMembersList)
  async getMembersList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetMembersListRequest = request.body;

    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let members = await this.db.drizzle.query.membersTable
      .findMany({
        where: eq(membersTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.membersService.entToTab(x)));

    let payload: ToBackendGetMembersListResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      membersList: members.map(x =>
        this.envsService.wrapToApiEnvUser({ member: x })
      )
    };

    return payload;
  }
}
