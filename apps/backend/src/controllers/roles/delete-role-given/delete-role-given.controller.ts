import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteRoleGivenRequestDto,
  ToBackendDeleteRoleGivenResponseDto
} from '#backend/controllers/roles/delete-role-given/delete-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  RoleTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { GetRoleCheckExistsResultError } from '#common/types/backend/function-errors/get-role-check-exists-result-error';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRoleGivenOutput } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteRoleGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          this.membersService.getMemberCheckIsAdminResult({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'role',
        (v): Result.ResultAsync<RoleTab, GetRoleCheckExistsResultError> =>
          this.rolesService.getRoleCheckExistsResult({
            projectId: v.projectId,
            roleId: v.roleId
          })
      ),
      Result.inspect(v => {
        v.role.gvs = v.role.gvs.filter(gv => gv.givenId !== v.givenId);
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { roles: [v.role] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesResultError> =>
          this.rolesService.getApiRolesResult({ projectId: v.projectId })
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
