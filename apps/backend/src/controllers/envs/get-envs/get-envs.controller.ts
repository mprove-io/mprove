import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetEnvsRequestDto,
  ToBackendGetEnvsResponseDto
} from '#backend/controllers/envs/get-envs/get-envs.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetEnvsOutput } from '#common/types/backend/routes/envs/get-envs/get-envs-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetEnvsController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetEnvs' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetEnvs',
    description: 'Get environments accessible to the user'
  })
  @ApiOkResponse({
    type: ToBackendGetEnvsResponseDto
  })
  async getEnvs(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetEnvsRequestDto
  ) {
    let { projectId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendGetEnvsOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      envs: apiEnvs
    };

    return payload;
  }
}
