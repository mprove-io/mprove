import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendCreateBranchRequestDto,
  ToBackendCreateBranchResponseDto
} from '#backend/controllers/branches/create-branch/create-branch.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID, PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { BackendSessionBranchCannotBeCreatedError } from '#common/types/backend/errors/backend-session-branch-cannot-be-created-error';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { CheckRepoIdError } from '#common/types/backend/function-errors/check-repo-id-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateBranchOutput } from '#common/types/backend/routes/branches/create-branch/create-branch-output';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import type { ToDiskCreateBranchOutput } from '#common/types/disk/routes/branches/create-branch/create-branch-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateBranchController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private membersService: MembersService,
    private blockmlService: BlockmlService,
    private db: DbService
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
      Result.bind(
        'repoType',
        (v): Result.ResultAsync<RepoType, CheckRepoIdError> =>
          this.sessionsService.checkRepoId({
            repoId: v.repoId,
            userId: v.userId,
            projectId: v.projectId,
            allowProdRepo: true
          })
      ),
      Result.andThrough(v =>
        v.repoType === 'session'
          ? Result.fail({
              code: 'BACKEND_SESSION_BRANCH_CANNOT_BE_CREATED'
            } satisfies BackendSessionBranchCannotBeCreatedError)
          : Result.succeed()
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsEditor({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'fromBranch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.fromBranchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.branchesService.checkBranchDoesNotExist({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.newBranchId
        })
      ),
      Result.bind(
        'diskCreateBranchOutput',
        (v): Result.ResultAsync<ToDiskCreateBranchOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
            request: {
              operation: 'createBranch',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
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
      Result.bind(
        'newBranch',
        (v): Result.Result<BranchTab, never> =>
          Result.succeed(
            this.branchesService.makeBranch({
              projectId: v.projectId,
              repoId: v.repoId,
              branchId: v.newBranchId
            })
          )
      ),
      Result.bind(
        'fromBranchBridges',
        (v): Result.ResultAsync<BridgeTab[], BridgeEntToTabError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.fromBranch.projectId),
              eq(bridgesTable.repoId, v.fromBranch.repoId),
              eq(bridgesTable.branchId, v.fromBranch.branchId)
            )
          })
      ),
      Result.bind(
        'newBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.fromBranchBridges.map(bridge =>
              this.bridgesService.makeBridge({
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
        this.blockmlService.rebuildBranchBridges({
          branchBridges: v.newBranchBridges,
          envId: PROJECT_ENV_PROD,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskCreateBranchOutput.files,
          mproveDir: v.diskCreateBranchOutput.mproveDir
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
