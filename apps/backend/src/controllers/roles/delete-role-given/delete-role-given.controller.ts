import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendDeleteRoleGivenRequestDto,
  ToBackendDeleteRoleGivenResponseDto
} from '#backend/controllers/roles/delete-role-given/delete-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRoleGivenOutput } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteRoleGivenController {
  constructor(
    private membersService: MembersService,
    private rolesService: RolesService,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteRoleGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteRoleGiven',
    description: 'Delete a project role given'
  })
  @ApiOkResponse({
    type: ToBackendDeleteRoleGivenResponseDto
  })
  async deleteRoleGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteRoleGivenRequestDto
  ): Promise<BackendResultForOperation<'deleteRoleGiven'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        roleId: body.input.roleId,
        givenId: body.input.givenId,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId
        })
      ),
      Result.bind('role', v =>
        this.db.roles.findFirstCheckExists({
          where: and(
            eq(rolesTable.projectId, v.projectId),
            eq(rolesTable.roleId, v.roleId)
          )
        })
      ),
      Result.map(v => {
        v.role.gvs = v.role.gvs.filter(gv => gv.givenId !== v.givenId);
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { roles: [v.role] } })
      ),
      Result.bind('apiRoles', v =>
        this.rolesService.getApiRoles({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteRoleGivenOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles
        })
      )
    );
  }
}
