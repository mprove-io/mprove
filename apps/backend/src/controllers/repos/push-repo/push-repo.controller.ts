import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendPushRepoRequestDto,
  ToBackendPushRepoResponseDto
} from '#backend/controllers/repos/push-repo/push-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { BranchTab } from '#backend/drizzle/postgres/tables/branches';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import type { BridgeTab } from '#backend/drizzle/postgres/tables/bridges';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import {
  type RebuildStructOutput,
  rebuildStruct
} from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { makeBranch } from '#backend/functions/db/branches/make-branch/make-branch';
import { makeBridge } from '#backend/functions/db/bridges/make-bridge/make-bridge';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditor } from '#backend/functions/db/members/get-member-check-is-editor/get-member-check-is-editor';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
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
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
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
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsEditor({
          projectId: v.projectId,
          memberId: v.user.userId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined, // no check for repoId
          cs: this.cs
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
        getEnvCheckExistsAndAccess({
          db: this.db,
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
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
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
          productionBranch = makeBranch({
            projectId: v.projectId,
            repoId: PROD_REPO_ID,
            branchId: v.branchId
          });

          v.branchBridges.forEach(bridge => {
            let prodBranchBridge: BridgeTab = makeBridge({
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
              > = await rebuildStruct({
                traceId: v.traceId,
                orgId: v.project.orgId,
                projectId: v.projectId,
                repoId: v.repoId,
                structId: structId,
                diskFiles: v.diskPushRepoOutput.productionFiles,
                mproveDir: v.diskPushRepoOutput.productionMproveDir,
                envId: bridge.envId,
                selectedGivens: [],
                overrideTimezone: undefined,
                db: this.db,
                tabService: this.tabService,
                rpcService: this.rpcService,
                cs: this.cs,
                logger: this.logger
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
        getStructCheckExists({
          structId: v.currentBridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('modelPartXs', v =>
        getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: memberTabToApi({
            member: v.userMember
          }),
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendPushRepoOutput => ({
          repo: v.diskPushRepoOutput.repo,
          struct: structTabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          needValidate: v.currentBridge.needValidate
        })
      )
    );
  }
}
