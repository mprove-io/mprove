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
  ToBackendDeleteMemberRequestDto,
  ToBackendDeleteMemberResponseDto
} from '#backend/controllers/members/delete-member/delete-member.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteMemberOutput } from '#common/types/backend/routes/members/delete-member/delete-member-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteMemberController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteMember' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteMember',
    description: 'Remove a member from a project'
  })
  @ApiOkResponse({
    type: ToBackendDeleteMemberResponseDto
  })
  async deleteMember(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteMemberRequestDto
  ): Promise<BackendResultForOperation<'deleteMember'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        projectId: body.input.projectId,
        memberId: body.input.memberId,
        userId: user.userId
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        v.userId === v.memberId
          ? Result.fail({ code: 'BACKEND_ADMIN_CANNOT_DELETE_HIMSELF' })
          : Result.succeed()
      ),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            memberId: v.memberId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDiskResult({
          request: {
            operation: 'deleteDevRepo',
            traceId: v.traceId,
            input: {
              baseProject: this.tabService.projectTabToBaseProject({
                project: v.project
              }),
              devRepoId: v.member.memberId
            }
          }
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(membersTable)
                .where(
                  and(
                    eq(membersTable.projectId, v.projectId),
                    eq(membersTable.memberId, v.memberId)
                  )
                );

              await tx
                .delete(branchesTable)
                .where(
                  and(
                    eq(branchesTable.projectId, v.projectId),
                    eq(branchesTable.repoId, v.member.memberId)
                  )
                );

              await tx
                .delete(bridgesTable)
                .where(
                  and(
                    eq(bridgesTable.projectId, v.projectId),
                    eq(bridgesTable.repoId, v.member.memberId)
                  )
                );
            }),
          getRetryOption(this.cs, this.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteMemberOutput => ({}))
    );
  }
}
