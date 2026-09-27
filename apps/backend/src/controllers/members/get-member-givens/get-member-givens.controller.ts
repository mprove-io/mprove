import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetMemberGivensRequestDto,
  ToBackendGetMemberGivensResponseDto
} from '#backend/controllers/members/get-member-givens/get-member-givens.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendGetMemberGivensOutput } from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-response';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetMemberGivensController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService
  ) {}

  @Post('api/ToBackendGetMemberGivens' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetMemberGivens',
    description: 'Get effective given values available to a project member'
  })
  @ApiOkResponse({
    type: ToBackendGetMemberGivensResponseDto
  })
  async getMemberGivens(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetMemberGivensRequestDto
  ) {
    let { projectId, memberId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    let memberGivens = await this.givensService.getMemberGivensForSelection({
      projectId: projectId,
      roles: member.roles
    });

    let payload: ToBackendGetMemberGivensOutput = {
      memberGivens: memberGivens
    };

    return payload;
  }
}
