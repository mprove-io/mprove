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
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteBranchRequestDto,
  ToBackendDeleteBranchResponseDto
} from '#backend/controllers/branches/delete-branch/delete-branch.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteBranchController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteBranch' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteBranch',
    description: 'Delete a branch'
  })
  @ApiOkResponse({
    type: ToBackendDeleteBranchResponseDto
  })
  async deleteBranch(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteBranchRequestDto
  ) {
    let { projectId, repoId, branchId } = body.input;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    if (repoType === 'session') {
      throw new ServerError({
        message: 'BACKEND_SESSION_BRANCH_CANNOT_BE_DELETED'
      });
    }

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditor({
      memberId: user.userId,
      projectId: projectId
    });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: repoId
    });

    if (branchId === project.defaultBranch) {
      throw new ServerError({
        message: 'BACKEND_DEFAULT_BRANCH_CANNOT_BE_DELETED'
      });
    }

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    await this.rpcService.sendToDiskUnwrapOutput({
      request: {
        operation: 'deleteBranch',
        traceId: body.traceId,
        input: {
          baseProject: baseProject,
          repoId: repoId,
          branch: branchId
        }
      }
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(branchesTable)
            .where(
              and(
                eq(branchesTable.projectId, projectId),
                eq(branchesTable.repoId, repoId),
                eq(branchesTable.branchId, branchId)
              )
            );

          await tx
            .delete(bridgesTable)
            .where(
              and(
                eq(bridgesTable.projectId, projectId),
                eq(bridgesTable.repoId, repoId),
                eq(bridgesTable.branchId, branchId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
