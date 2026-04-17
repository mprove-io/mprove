import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetMembersListRequestDto,
  ToBackendGetMembersListResponseDto
} from '#backend/controllers/members/get-members-list/get-members-list.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetMembersListResponsePayload } from '#common/zod/to-backend/members/to-backend-get-members-list';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetMembersListController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMembersList)
  @ApiOperation({
    summary: 'GetMembersList',
    description: 'Get the full list of project members'
  })
  @ApiOkResponse({
    type: ToBackendGetMembersListResponseDto
  })
  async getMembersList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetMembersListRequestDto
  ) {
    let { projectId } = body.payload;

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
      .then(xs => xs.map(x => this.tabService.memberEntToTab(x)));

    let payload: ToBackendGetMembersListResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      membersList: members.map(x =>
        this.envsService.wrapToApiEnvUser({ member: x })
      )
    };

    return payload;
  }
}
