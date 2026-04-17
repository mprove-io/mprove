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
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type {
  ToDiskDeleteBranchRequest,
  ToDiskDeleteBranchResponse
} from '#common/zod/to-disk/05-branches/to-disk-delete-branch';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteBranch)
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
    let { projectId, repoId, branchId } = body.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    if (repoType === RepoTypeEnum.Session) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_BRANCH_CANNOT_BE_DELETED
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
        message: ErEnum.BACKEND_DEFAULT_BRANCH_CANNOT_BE_DELETED
      });
    }

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskDeleteBranchRequest: ToDiskDeleteBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: body.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskDeleteBranchResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        message: toDiskDeleteBranchRequest,
        checkIsOk: true
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
