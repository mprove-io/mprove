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
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteUserRequestDto,
  ToBackendDeleteUserResponseDto
} from '#backend/controllers/users/delete-user/delete-user.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import {
  type MemberEnt,
  membersTable
} from '#backend/drizzle/postgres/schema/members';
import type { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { asyncPoolResult } from '#backend/functions/async-pool-result/async-pool-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

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
    @Inject(DRIZZLE) private db: Db
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
        this.usersService.checkUserIsNotRestrictedResult({ user: v.user })
      ),
      Result.bind(
        'ownerOrgEnts',
        (v): Result.ResultAsync<OrgEnt[], never> =>
          this.db.drizzle.query.orgsTable
            .findMany({
              where: eq(orgsTable.ownerId, v.user.userId)
            })
            .then(xs => Result.succeed(xs))
      ),
      Result.andThrough(v =>
        v.ownerOrgEnts.length > 0
          ? Result.fail({
              code: 'BACKEND_USER_IS_ORG_OWNER',
              displayData: {
                orgIds: v.ownerOrgEnts.map(orgEnt => orgEnt.orgId)
              }
            })
          : Result.succeed()
      ),
      Result.bind(
        'userAdminMemberEnts',
        (v): Result.ResultAsync<MemberEnt[], never> =>
          this.db.drizzle.query.membersTable
            .findMany({
              where: and(
                eq(membersTable.memberId, v.user.userId),
                eq(membersTable.isAdmin, true)
              )
            })
            .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'userAdminProjectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.userAdminMemberEnts.map(memberEnt => memberEnt.projectId)
          )
      ),
      Result.bind(
        'adminEnts',
        async (v): Result.ResultAsync<MemberEnt[], never> =>
          v.userAdminProjectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.membersTable
                .findMany({
                  where: and(
                    inArray(membersTable.projectId, v.userAdminProjectIds),
                    eq(membersTable.isAdmin, true)
                  )
                })
                .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'erProjectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.userAdminProjectIds.filter(
              projectId =>
                v.adminEnts.filter(
                  memberEnt => memberEnt.projectId === projectId
                ).length === 1
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
        'userMemberEnts',
        (v): Result.ResultAsync<MemberEnt[], never> =>
          this.db.drizzle.query.membersTable
            .findMany({
              where: eq(membersTable.memberId, v.user.userId)
            })
            .then(xs => Result.succeed(xs))
      ),
      Result.bind(
        'projectIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.userMemberEnts.map(memberEnt => memberEnt.projectId))
      ),
      Result.bind(
        'projects',
        async (v): Result.ResultAsync<ProjectTab[], ProjectEntToTabError> =>
          v.projectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.projectsTable
                .findMany({
                  where: inArray(projectsTable.projectId, v.projectIds)
                })
                .then(xs =>
                  Result.sequence(xs, x =>
                    this.tabService.projectEntToTabResult({ projectEnt: x })
                  )
                )
      ),
      Result.andThrough(v =>
        asyncPoolResult({
          poolSize: 1,
          inputs: v.userMemberEnts,
          callback: async memberEnt => {
            let project: ProjectTab = v.projects.find(
              p => p.projectId === memberEnt.projectId
            );

            let baseProject: BaseProject =
              this.tabService.projectTabToBaseProject({
                project: project
              });

            return this.rpcService.sendToDiskResult({
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
