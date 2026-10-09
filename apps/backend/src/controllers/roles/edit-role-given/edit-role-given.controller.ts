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
  ToBackendEditRoleGivenRequestDto,
  ToBackendEditRoleGivenResponseDto
} from '#backend/controllers/roles/edit-role-given/edit-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  GivenTab,
  MemberTab,
  RoleTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetGivenCheckExistsResultError } from '#common/types/backend/function-errors/get-given-check-exists-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { GetRoleCheckExistsResultError } from '#common/types/backend/function-errors/get-role-check-exists-result-error';
import type { GetRoleGivenCheckExistsResultError } from '#common/types/backend/function-errors/get-role-given-check-exists-result-error';
import type { Gv } from '#common/types/backend/parts/gv';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditRoleGivenOutput } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditRoleGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'roleGiven',
        (v): Result.Result<Gv, GetRoleGivenCheckExistsResultError> =>
          this.rolesService.getRoleGivenCheckExistsResult({
            role: v.role,
            givenId: v.givenId
          })
      ),
      Result.bind(
        'given',
        (v): Result.ResultAsync<GivenTab, GetGivenCheckExistsResultError> =>
          this.givensService.getGivenCheckExistsResult({
            projectId: v.projectId,
            givenId: v.givenId
          })
      ),
      Result.andThrough(v =>
        this.givensService.validateGivenValuesResult({
          type: v.given.type,
          isMultiple: v.given.isMultiple === true,
          values: v.values
        })
      ),
      Result.inspect(v => {
        v.roleGiven.values = v.values;
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
        (v): ToBackendEditRoleGivenOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles
        })
      )
    );
  }
}
