import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendPushRepoRequestDto,
  ToBackendPushRepoResponseDto
} from '#backend/controllers/repos/push-repo/push-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendPushRepoOutput } from '#common/types/backend/routes/repos/push-repo/push-repo-output';

@ApiTags('Repos')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PushRepoController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendPushRepo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'PushRepo',
    description: 'Push branch commits to the remote repo'
  })
  @ApiOkResponse({
    type: ToBackendPushRepoResponseDto
  })
  async pushRepo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendPushRepoRequestDto
  ): Promise<BackendResultForOperation<'pushRepo'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        traceId: body.traceId,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.membersService.getMemberCheckIsEditor({
          projectId: v.projectId,
          memberId: v.user.userId
        })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined // no check for repoId
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('diskPushRepoOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'pushRepo',
            traceId: v.traceId,
            input: {
              baseProject: this.tabService.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              userAlias: v.user.alias
            }
          }
        })
      ),
      Result.bind('branchBridges', v =>
        this.db.bridges.findMany({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId)
          )
        })
      ),
      Result.bind('prodBranch', v =>
        this.db.branches.findFirst({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, PROD_REPO_ID),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.bind('prodBranchBridges', v =>
        this.db.bridges.findMany({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, PROD_REPO_ID),
            eq(bridgesTable.branchId, v.branch.branchId)
          )
        })
      ),
      Result.bind('productionBranch', v => {
        let productionBranch: BranchTab = v.prodBranch;

        if (isUndefined(productionBranch)) {
          productionBranch = this.branchesService.makeBranch({
            projectId: v.projectId,
            repoId: PROD_REPO_ID,
            branchId: v.branchId
          });

          v.branchBridges.forEach(bridge => {
            let prodBranchBridge: BridgeTab = this.bridgesService.makeBridge({
              projectId: v.branch.projectId,
              repoId: PROD_REPO_ID,
              branchId: v.branch.branchId,
              envId: bridge.envId,
              structId: EMPTY_STRUCT_ID,
              needValidate: true
            });

            v.prodBranchBridges.push(prodBranchBridge);
          });
        }

        return Result.succeed(productionBranch);
      }),
      Result.andThrough(v =>
        Result.sequence(
          v.prodBranchBridges,
          async (bridge): Result.ResultAsync<void, RebuildStructError> => {
            if (bridge.envId === PROJECT_ENV_PROD || bridge.envId === v.envId) {
              let structId: string = makeId();

              let result: Result.Result<
                RebuildStructOutput,
                RebuildStructError
              > = await this.blockmlService.rebuildStruct({
                traceId: v.traceId,
                orgId: v.project.orgId,
                projectId: v.projectId,
                repoId: v.repoId,
                structId: structId,
                diskFiles: v.diskPushRepoOutput.productionFiles,
                mproveDir: v.diskPushRepoOutput.productionMproveDir,
                envId: bridge.envId,
                selectedGivens: [],
                overrideTimezone: undefined
              });

              if (Result.isFailure(result)) {
                return result;
              }

              bridge.structId = structId;
              bridge.needValidate = false;
            } else {
              bridge.structId = EMPTY_STRUCT_ID;
              bridge.needValidate = true;
            }

            return Result.succeed();
          }
        )
      ),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            branches: [v.productionBranch],
            bridges: [...v.prodBranchBridges]
          }
        })
      ),
      Result.bind('currentBridge', v =>
        Result.succeed(v.branchBridges.find(bridge => bridge.envId === v.envId))
      ),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.currentBridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: this.membersService.tabToApi({
            member: v.userMember
          })
        })
      ),
      Result.map(
        (v): ToBackendPushRepoOutput => ({
          repo: v.diskPushRepoOutput.repo,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          needValidate: v.currentBridge.needValidate
        })
      )
    );
  }
}
