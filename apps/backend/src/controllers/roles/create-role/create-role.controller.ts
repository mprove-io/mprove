import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendCreateRoleRequestDto,
  ToBackendCreateRoleResponseDto
} from '#backend/controllers/roles/create-role/create-role.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkRoleDoesNotExist } from '#backend/functions/db/roles/check-role-does-not-exist/check-role-does-not-exist';
import { getApiRoles } from '#backend/functions/db/roles/get-api-roles/get-api-roles';
import { makeRole } from '#backend/functions/db/roles/make-role/make-role';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateRoleOutput } from '#common/types/backend/routes/roles/create-role/create-role-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendCreateRole' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateRole',
    description: 'Create a project role'
  })
  @ApiOkResponse({
    type: ToBackendCreateRoleResponseDto
  })
  async createRole(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateRoleRequestDto
  ): Promise<BackendResultForOperation<'createRole'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        roleId: body.input.roleId,
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
      Result.andThrough(v =>
        checkRoleDoesNotExist({
          projectId: v.projectId,
          roleId: v.roleId,
          db: this.db
        })
      ),
      Result.bind('role', v =>
        Result.succeed(
          makeRole({
            projectId: v.projectId,
            roleId: v.roleId,
            gvs: []
          })
        )
      ),
      Result.andThrough(v => this.db.write({ insert: { roles: [v.role] } })),
      Result.bind('apiRoles', v =>
        getApiRoles({
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendCreateRoleOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          roles: v.apiRoles
        })
      )
    );
  }
}
