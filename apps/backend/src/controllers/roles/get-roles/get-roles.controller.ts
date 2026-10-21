import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetRolesRequestDto,
  ToBackendGetRolesResponseDto
} from '#backend/controllers/roles/get-roles/get-roles.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetRolesOutput } from '#common/types/backend/routes/roles/get-roles/get-roles-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetRolesController {
  constructor(
    private membersService: MembersService,
    private rolesService: RolesService,
    private givensService: GivensService,
    private db: DbService
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
  ): Promise<BackendResultForOperation<'getRoles'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('apiRoles', v =>
        this.rolesService.getApiRoles({ projectId: v.projectId })
      ),
      Result.bind('apiGivens', v =>
        this.givensService.getApiGivens({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendGetRolesOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles,
          givens: v.apiGivens
        })
      )
    );
  }
}
