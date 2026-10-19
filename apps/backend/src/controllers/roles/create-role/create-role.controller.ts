import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCreateRoleRequestDto,
  ToBackendCreateRoleResponseDto
} from '#backend/controllers/roles/create-role/create-role.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  RoleTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiRolesError } from '#common/types/backend/function-errors/get-api-roles-error';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateRoleOutput } from '#common/types/backend/routes/roles/create-role/create-role-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleController {
  constructor(
    private membersService: MembersService,
    private rolesService: RolesService,
    private db: DbService
  ) {}

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
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminError> =>
          this.membersService.getMemberCheckIsAdmin({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.rolesService.checkRoleDoesNotExist({
          projectId: v.projectId,
          roleId: v.roleId
        })
      ),
      Result.bind(
        'role',
        (v): Result.Result<RoleTab, never> =>
          Result.succeed(
            this.rolesService.makeRole({
              projectId: v.projectId,
              roleId: v.roleId,
              gvs: []
            })
          )
      ),
      Result.andThrough(v => this.db.write({ insert: { roles: [v.role] } })),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesError> =>
          this.rolesService.getApiRoles({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateRoleOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles
        })
      )
    );
  }
}
