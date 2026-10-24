import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendCreateRoleGivenRequestDto,
  ToBackendCreateRoleGivenResponseDto
} from '#backend/controllers/roles/create-role-given/create-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { validateGivenValues } from '#backend/functions/db/givens/validate-given-values/validate-given-values';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkRoleGivenDoesNotExist } from '#backend/functions/db/roles/check-role-given-does-not-exist/check-role-given-does-not-exist';
import { getApiRoles } from '#backend/functions/db/roles/get-api-roles/get-api-roles';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateRoleGivenOutput } from '#common/types/backend/routes/roles/create-role-given/create-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleGivenController {
  constructor(private db: DbService) {}

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
      Result.andThrough(v =>
        checkRoleGivenDoesNotExist({
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
      Result.bind('apiRoles', v =>
        getApiRoles({
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendCreateRoleGivenOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          roles: v.apiRoles
        })
      )
    );
  }
}
