import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetRolesRequestDto,
  ToBackendGetRolesResponseDto
} from '#backend/controllers/roles/get-roles/get-roles.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RolesService } from '#backend/services/db/roles.service';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendGetRolesOutput } from '#common/zod/backend/routes/roles/get-roles/get-roles-response';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetRolesController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private givensService: GivensService
  ) {}

  @Post('api/ToBackendGetRoles' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetRoles',
    description: 'Get project roles'
  })
  @ApiOkResponse({
    type: ToBackendGetRolesResponseDto
  })
  async getRoles(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetRolesRequestDto
  ) {
    let { projectId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let apiRoles = await this.rolesService.getApiRoles({
      projectId: projectId
    });

    let apiGivens = await this.givensService.getApiGivens({
      projectId: projectId
    });

    let payload: ToBackendGetRolesOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      roles: apiRoles,
      givens: apiGivens
    };

    return payload;
  }
}
