import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteUserRequestDto,
  ToBackendDeleteUserResponseDto
} from '#backend/controllers/users/delete-user/delete-user.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  OrgTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { OrgEntToTabError } from '#common/types/backend/function-errors/org-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteUserController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteUser' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteUser',
    description: 'Delete the current user'
  })
  @ApiOkResponse({
    type: ToBackendDeleteUserResponseDto
  })
  async deleteUser(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteUserRequestDto
  ): Promise<BackendResultForOperation<'deleteUser'>> {
    return Result.pipe(
      Result.succeed({ user: user, traceId: body.traceId }),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
      Result.bind(
        'ownerOrgs',
        (v): Result.ResultAsync<OrgTab[], OrgEntToTabError> =>
          this.db.orgs.findMany({
            where: eq(orgsTable.ownerId, v.user.userId)
          })
      ),
      Result.andThrough(v =>
        v.ownerOrgs.length > 0
          ? Result.fail({
              code: 'BACKEND_USER_IS_ORG_OWNER',
              displayData: {
                orgIds: v.ownerOrgs.map(org => org.orgId)
              }
            })
          : Result.succeed()
      ),
      Result.bind(
        'userAdminMembers',
        (v): Result.ResultAsync<MemberTab[], MemberEntToTabError> =>
          this.db.members.findMany({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.isAdmin, true)
            )
          })
      ),
      Result.bind(
        'userAdminProjectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.userAdminMembers.map(member => member.projectId))
      ),
      Result.bind(
        'admins',
        async (v): Result.ResultAsync<MemberTab[], MemberEntToTabError> =>
          v.userAdminProjectIds.length === 0
            ? Result.succeed([])
            : this.db.members.findMany({
                where: and(
                  inArray(membersTable.projectId, v.userAdminProjectIds),
                  eq(membersTable.isAdmin, true)
                )
              })
      ),
      Result.bind(
        'erProjectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.userAdminProjectIds.filter(
              projectId =>
                v.admins.filter(member => member.projectId === projectId)
                  .length === 1
            )
          )
      ),
      Result.andThrough(v =>
        v.erProjectIds.length > 0
          ? Result.fail({
              code: 'BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN',
              displayData: { projectIds: v.erProjectIds }
            })
          : Result.succeed()
      ),
      Result.bind(
        'userMembers',
        (v): Result.ResultAsync<MemberTab[], MemberEntToTabError> =>
          this.db.members.findMany({
            where: eq(membersTable.memberId, v.user.userId)
          })
      ),
      Result.bind(
        'projectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.userMembers.map(member => member.projectId))
      ),
      Result.bind(
        'projects',
        async (v): Result.ResultAsync<ProjectTab[], ProjectEntToTabError> =>
          v.projectIds.length === 0
            ? Result.succeed([])
            : this.db.projects.findMany({
                where: inArray(projectsTable.projectId, v.projectIds)
              })
      ),
      Result.andThrough(v =>
        customAsyncPool({
          poolSize: 1,
          inputs: v.userMembers,
          callback: async (member: MemberTab) => {
            let project: ProjectTab = v.projects.find(
              p => p.projectId === member.projectId
            );

            let baseProject: BaseProject =
              this.tabService.projectTabToBaseProject({
                project: project
              });

            return this.rpcService.sendToDisk({
              request: {
                operation: 'deleteDevRepo',
                traceId: v.traceId,
                input: { baseProject: baseProject, devRepoId: v.user.userId }
              }
            });
          }
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(usersTable)
                .where(eq(usersTable.userId, v.user.userId));

              await tx
                .delete(membersTable)
                .where(eq(membersTable.memberId, v.user.userId));

              await tx
                .delete(branchesTable)
                .where(eq(branchesTable.repoId, v.user.alias));
            }),
          getRetryOption(this.cs, this.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): Record<string, never> => ({}))
    );
  }
}
