import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditRoleGivenRequestDto,
  ToBackendEditRoleGivenResponseDto
} from '#backend/controllers/roles/edit-role-given/edit-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { validateGivenValues } from '#backend/functions/db/givens/validate-given-values/validate-given-values';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditRoleGivenOutput } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditRoleGivenController {
  constructor(
    private membersService: MembersService,
    private rolesService: RolesService,
    private db: DbService
  ) {}

  @Post('api/ToBackendEditRoleGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditRoleGiven',
    description: 'Edit a project role given'
  })
  @ApiOkResponse({
    type: ToBackendEditRoleGivenResponseDto
  })
  async editRoleGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditRoleGivenRequestDto
  ): Promise<BackendResultForOperation<'editRoleGiven'>> {
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
      Result.bind('roleGiven', v =>
        this.rolesService.getRoleGivenCheckExists({
          role: v.role,
          givenId: v.givenId
        })
      ),
      Result.bind('given', v =>
        this.db.givens.findFirstCheckExists({
          where: and(
            eq(givensTable.projectId, v.projectId),
            eq(givensTable.givenId, v.givenId)
          )
        })
      ),
      Result.andThrough(v =>
        validateGivenValues({
          type: v.given.type,
          isMultiple: v.given.isMultiple === true,
          values: v.values
        })
      ),
      Result.map(v => {
        v.roleGiven.values = v.values;
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { roles: [v.role] } })
      ),
      Result.bind('apiRoles', v =>
        this.rolesService.getApiRoles({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendEditRoleGivenOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles
        })
      )
    );
  }
}
