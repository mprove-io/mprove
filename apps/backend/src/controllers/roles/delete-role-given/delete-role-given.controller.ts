import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendDeleteRoleGivenRequestDto,
  ToBackendDeleteRoleGivenResponseDto
} from '#backend/controllers/roles/delete-role-given/delete-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { rolesTable } from '#backend/drizzle/postgres/tables/roles';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getApiRoles } from '#backend/functions/db/roles/get-api-roles/get-api-roles';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRoleGivenOutput } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteRoleGivenController {
  constructor(private db: DbService) {}

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
        getMemberCheckIsAdmin({
          memberId: v.user.userId,
          projectId: v.projectId,
          db: this.db
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
        getApiRoles({
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendDeleteRoleGivenOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          roles: v.apiRoles
        })
      )
    );
  }
}
