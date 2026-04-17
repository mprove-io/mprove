import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetEnvsRequestDto,
  ToBackendGetEnvsResponseDto
} from '#backend/controllers/envs/get-envs/get-envs.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetEnvsResponsePayload } from '#common/zod/to-backend/envs/to-backend-get-envs';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetEnvs)
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
    let { projectId } = body.payload;

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

    let payload: ToBackendGetEnvsResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      envs: apiEnvs
    };

    return payload;
  }
}
