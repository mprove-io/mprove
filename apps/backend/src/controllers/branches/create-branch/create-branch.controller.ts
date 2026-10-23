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
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkBranchDoesNotExist } from '#backend/functions/db/branches/check-branch-does-not-exist/check-branch-does-not-exist';
import { makeBranch } from '#backend/functions/db/branches/make-branch/make-branch';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { HashService } from '#backend/services/hash/hash.service';
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
    private sessionsService: SessionsService,
    private hashService: HashService,
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
      Result.bind('repoType', v =>
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
      Result.bind('project', v =>
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
            hashService: this.hashService,
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
