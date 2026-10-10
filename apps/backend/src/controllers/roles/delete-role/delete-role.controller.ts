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
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteRoleRequestDto,
  ToBackendDeleteRoleResponseDto
} from '#backend/controllers/roles/delete-role/delete-role.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { MemberEntToTabResultError } from '#common/types/backend/function-errors/member-ent-to-tab-result-error';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRoleOutput } from '#common/types/backend/routes/roles/delete-role/delete-role-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteRoleController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteRole' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteRole',
    description: 'Delete a project role'
  })
  @ApiOkResponse({
    type: ToBackendDeleteRoleResponseDto
  })
  async deleteRole(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteRoleRequestDto
  ): Promise<BackendResultForOperation<'deleteRole'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        roleId: body.input.roleId,
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
        'projectMembers',
        (v): Result.ResultAsync<MemberTab[], MemberEntToTabResultError> =>
          this.db.drizzle.query.membersTable
            .findMany({ where: eq(membersTable.projectId, v.projectId) })
            .then(memberEnts =>
              Result.sequence(memberEnts, memberEnt =>
                this.tabService.memberEntToTabResult({ memberEnt: memberEnt })
              )
            )
      ),
      Result.bind(
        'membersToUpdate',
        (v): Result.Result<MemberTab[], never> =>
          Result.succeed(
            v.projectMembers.filter(member => member.roles.includes(v.roleId))
          )
      ),
      Result.map(v => {
        v.membersToUpdate.forEach(member => {
          member.roles = member.roles.filter(role => role !== v.roleId);
        });
        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(rolesTable)
                    .where(
                      and(
                        eq(rolesTable.projectId, v.projectId),
                        eq(rolesTable.roleId, v.roleId)
                      )
                    );

                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { members: v.membersToUpdate }
                  });
                }),
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
      Result.bind(
        'responseUserMember',
        (v): Result.Result<MemberTab, never> => {
          let updatedUserMember: MemberTab = v.membersToUpdate.find(
            member => member.memberId === v.userMember.memberId
          );

          return Result.succeed(
            isDefined(updatedUserMember) ? updatedUserMember : v.userMember
          );
        }
      ),
      Result.map(
        (v): ToBackendDeleteRoleOutput => ({
          userMember: this.membersService.tabToApi({
            member: v.responseUserMember
          }),
          roles: v.apiRoles
        })
      )
    );
  }
}
