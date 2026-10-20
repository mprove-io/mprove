import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendCreateRoleGivenRequestDto,
  ToBackendCreateRoleGivenResponseDto
} from '#backend/controllers/roles/create-role-given/create-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  GivenTab,
  MemberTab,
  RoleTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { DbGivensFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/givens/db-givens-find-first-check-exists-error';
import type { DbRolesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/roles/db-roles-find-first-check-exists-error';
import type { GetApiRolesError } from '#common/types/backend/function-errors/get-api-roles-error';
import type { GetMemberCheckIsAdminError } from '#common/types/backend/function-errors/get-member-check-is-admin-error';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateRoleGivenOutput } from '#common/types/backend/routes/roles/create-role-given/create-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleGivenController {
  constructor(
    private membersService: MembersService,
    private givensService: GivensService,
    private rolesService: RolesService,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateRoleGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateRoleGiven',
    description: 'Create a project role given'
  })
  @ApiOkResponse({
    type: ToBackendCreateRoleGivenResponseDto
  })
  async createRoleGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateRoleGivenRequestDto
  ): Promise<BackendResultForOperation<'createRoleGiven'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        roleId: body.input.roleId,
        givenId: body.input.givenId,
        values: body.input.values,
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
      Result.bind(
        'role',
        (v): Result.ResultAsync<RoleTab, DbRolesFindFirstCheckExistsError> =>
          this.db.roles.findFirstCheckExists({
            where: and(
              eq(rolesTable.projectId, v.projectId),
              eq(rolesTable.roleId, v.roleId)
            )
          })
      ),
      Result.bind(
        'given',
        (v): Result.ResultAsync<GivenTab, DbGivensFindFirstCheckExistsError> =>
          this.db.givens.findFirstCheckExists({
            where: and(
              eq(givensTable.projectId, v.projectId),
              eq(givensTable.givenId, v.givenId)
            )
          })
      ),
      Result.andThrough(v =>
        this.givensService.validateGivenValues({
          type: v.given.type,
          isMultiple: v.given.isMultiple === true,
          values: v.values
        })
      ),
      Result.andThrough(v =>
        this.rolesService.checkRoleGivenDoesNotExist({
          role: v.role,
          givenId: v.givenId
        })
      ),
      Result.map(v => {
        v.role.gvs.push({ givenId: v.givenId, values: v.values });
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { roles: [v.role] } })
      ),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesError> =>
          this.rolesService.getApiRoles({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateRoleGivenOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles
        })
      )
    );
  }
}
