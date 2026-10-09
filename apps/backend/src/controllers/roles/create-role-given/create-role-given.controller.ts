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
  ToBackendCreateRoleGivenRequestDto,
  ToBackendCreateRoleGivenResponseDto
} from '#backend/controllers/roles/create-role-given/create-role-given.dto';
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
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateRoleGivenOutput } from '#common/types/backend/routes/roles/create-role-given/create-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        ...body.input,
        user: user,
        projectsService: this.projectsService,
        membersService: this.membersService,
        rolesService: this.rolesService,
        givensService: this.givensService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          v.membersService.getMemberCheckIsAdminResult({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'role',
        (v): Result.ResultAsync<RoleTab, GetRoleCheckExistsResultError> =>
          v.rolesService.getRoleCheckExistsResult({
            projectId: v.projectId,
            roleId: v.roleId
          })
      ),
      Result.bind(
        'given',
        (v): Result.ResultAsync<GivenTab, GetGivenCheckExistsResultError> =>
          v.givensService.getGivenCheckExistsResult({
            projectId: v.projectId,
            givenId: v.givenId
          })
      ),
      Result.andThrough(v =>
        v.givensService.validateGivenValuesResult({
          type: v.given.type,
          isMultiple: v.given.isMultiple === true,
          values: v.values
        })
      ),
      Result.andThrough(v =>
        v.rolesService.checkRoleGivenDoesNotExistResult({
          role: v.role,
          givenId: v.givenId
        })
      ),
      Result.inspect(v => {
        v.role.gvs.push({ givenId: v.givenId, values: v.values });
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { roles: [v.role] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesResultError> =>
          v.rolesService.getApiRolesResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateRoleGivenOutput => ({
          userMember: v.membersService.tabToApi({ member: v.userMember }),
          roles: v.apiRoles
        })
      )
    );
  }
}
