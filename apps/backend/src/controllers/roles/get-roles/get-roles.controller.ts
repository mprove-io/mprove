import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetRolesRequestDto,
  ToBackendGetRolesResponseDto
} from '#backend/controllers/roles/get-roles/get-roles.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetApiGivensResultError } from '#common/types/backend/function-errors/get-api-givens-result-error';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetRolesOutput } from '#common/types/backend/routes/roles/get-roles/get-roles-output';

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
  ): Promise<BackendResultForOperation<'getRoles'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        user: user
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesResultError> =>
          this.rolesService.getApiRolesResult({ projectId: v.projectId })
      ),
      Result.bind(
        'apiGivens',
        (v): Result.ResultAsync<Given[], GetApiGivensResultError> =>
          this.givensService.getApiGivensResult({ projectId: v.projectId })
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
