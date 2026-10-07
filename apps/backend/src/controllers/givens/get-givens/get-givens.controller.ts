import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetGivensRequestDto,
  ToBackendGetGivensResponseDto
} from '#backend/controllers/givens/get-givens/get-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetGivensOutput } from '#common/types/backend/routes/givens/get-givens/get-givens-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetGivensController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService
  ) {}

  @Post('api/ToBackendGetGivens' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetGivens',
    description: 'Get project givens'
  })
  @ApiOkResponse({
    type: ToBackendGetGivensResponseDto
  })
  async getGivens(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetGivensRequestDto
  ) {
    let { projectId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      projectId: projectId,
      memberId: user.userId
    });

    let apiGivens = await this.givensService.getApiGivens({
      projectId: projectId
    });

    let payload: ToBackendGetGivensOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      givens: apiGivens
    };

    return payload;
  }
}
