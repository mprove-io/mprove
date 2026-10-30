import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCreateBranchRequestDto,
  ToBackendCreateBranchResponseDto
} from '#backend/controllers/branches/create-branch/create-branch.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { rebuildBranchBridges } from '#backend/functions/blockml/rebuild-branch-bridges/rebuild-branch-bridges';
import { checkBranchDoesNotExist } from '#backend/functions/db/branches/check-branch-does-not-exist/check-branch-does-not-exist';
import { makeBranch } from '#backend/functions/db/branches/make-branch/make-branch';
import { makeBridge } from '#backend/functions/db/bridges/make-bridge/make-bridge';
import { getMemberCheckIsEditor } from '#backend/functions/db/members/get-member-check-is-editor/get-member-check-is-editor';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { BackendSessionBranchCannotBeCreatedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-created-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateBranchOutput } from '#common/types/backend/routes/branches/create-branch/create-branch-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateBranchController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  @Post('api/ToBackendCreateBranch' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateBranch',
    description: 'Create a new branch from an existing branch'
  })
  @ApiOkResponse({
    type: ToBackendCreateBranchResponseDto
  })
  async createBranch(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateBranchRequestDto
  ): Promise<BackendResultForOperation<'createBranch'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        newBranchId: body.input.newBranchId,
        fromBranchId: body.input.fromBranchId,
        repoId: body.input.repoId,
        traceId: body.traceId,
        userId: user.userId
      }),
      Result.bind('repoType', v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        v.repoType === 'session'
          ? Result.fail({
              code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_CREATED'
            } satisfies BackendSessionBranchCannotBeCreatedError)
          : Result.succeed()
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsEditor({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('fromBranch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.fromBranchId)
          )
        })
      ),
      Result.andThrough(v =>
        checkBranchDoesNotExist({
          db: this.db,
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.newBranchId
        })
      ),
      Result.bind('diskCreateBranchOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'createBranch',
            traceId: v.traceId,
            input: {
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
                project: v.project
              }),
              repoId: v.repoId,
              newBranch: v.newBranchId,
              fromBranch: v.fromBranchId,
              isFromRemote: false
            }
          }
        })
      ),
      Result.bind('newBranch', v =>
        Result.succeed(
          makeBranch({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.newBranchId
          })
        )
      ),
      Result.bind('fromBranchBridges', v =>
        this.db.bridges.findMany({
          where: and(
            eq(bridgesTable.projectId, v.fromBranch.projectId),
            eq(bridgesTable.repoId, v.fromBranch.repoId),
            eq(bridgesTable.branchId, v.fromBranch.branchId)
          )
        })
      ),
      Result.bind('newBranchBridges', v =>
        Result.succeed(
          v.fromBranchBridges.map(bridge =>
            makeBridge({
              projectId: v.newBranch.projectId,
              repoId: v.newBranch.repoId,
              branchId: v.newBranch.branchId,
              envId: bridge.envId,
              structId: EMPTY_STRUCT_ID,
              needValidate: true
            })
          )
        )
      ),
      Result.andThrough(v =>
        rebuildBranchBridges({
          branchBridges: v.newBranchBridges,
          envId: PROJECT_ENV_PROD,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskCreateBranchOutput.files,
          mproveDir: v.diskCreateBranchOutput.mproveDir,
          db: this.db,
          tabService: this.tabService,
          rpcService: this.rpcService,
          cs: this.cs,
          logger: this.logger
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insert: {
            branches: [v.newBranch],
            bridges: [...v.newBranchBridges]
          }
        })
      ),
      Result.map((v): ToBackendCreateBranchOutput => ({}))
    );
  }
}
