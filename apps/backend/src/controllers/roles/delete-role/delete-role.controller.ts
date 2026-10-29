import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteRoleRequestDto,
  ToBackendDeleteRoleResponseDto
} from '#backend/controllers/roles/delete-role/delete-role.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { rolesTable } from '#backend/drizzle/postgres/tables/roles';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getApiRoles } from '#backend/functions/db/roles/get-api-roles/get-api-roles';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRoleOutput } from '#common/types/backend/routes/roles/delete-role/delete-role-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteRoleController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
      Result.bind('projectMembers', v =>
        this.db.members.findMany({
          where: eq(membersTable.projectId, v.projectId)
        })
      ),
      Result.bind('membersToUpdate', v =>
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

                  await this.db.txWriteUnwrap({
                    tx: tx,
                    insertOrUpdate: { members: v.membersToUpdate }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind('apiRoles', v =>
        getApiRoles({
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('responseUserMember', v => {
        let updatedUserMember: MemberTab = v.membersToUpdate.find(
          member => member.memberId === v.userMember.memberId
        );

        return Result.succeed(
          isDefined(updatedUserMember) ? updatedUserMember : v.userMember
        );
      }),
      Result.map(
        (v): ToBackendDeleteRoleOutput => ({
          userMember: memberTabToApi({
            member: v.responseUserMember
          }),
          roles: v.apiRoles
        })
      )
    );
  }
}
