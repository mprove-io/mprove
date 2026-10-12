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
  ToBackendPushRepoRequestDto,
  ToBackendPushRepoResponseDto
} from '#backend/controllers/repos/push-repo/push-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
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
import type { BranchEntToTabError } from '#common/types/backend/function-errors/branch-ent-to-tab-error';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetMemberCheckIsEditorError } from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendPushRepoOutput } from '#common/types/backend/routes/repos/push-repo/push-repo-output';
import type { ToDiskPushRepoOutput } from '#common/types/disk/routes/repos/push-repo/push-repo-output';

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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorError> =>
          this.membersService.getMemberCheckIsEditorResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: undefined // no check for repoId
        })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'diskPushRepoOutput',
        (v): Result.ResultAsync<ToDiskPushRepoOutput, SendToDiskError> =>
          this.rpcService.sendToDiskResult({
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
      Result.bind(
        'branchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.branch.projectId),
                eq(bridgesTable.repoId, v.branch.repoId),
                eq(bridgesTable.branchId, v.branch.branchId)
              )
            })
            .then(branchBridgeEnts => Result.succeed(branchBridgeEnts))
      ),
      Result.bind(
        'prodBranch',
        (v): Result.ResultAsync<BranchTab, BranchEntToTabError> =>
          this.db.drizzle.query.branchesTable
            .findFirst({
              where: and(
                eq(branchesTable.projectId, v.projectId),
                eq(branchesTable.repoId, PROD_REPO_ID),
                eq(branchesTable.branchId, v.branchId)
              )
            })
            .then((x: BranchEnt) =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.branchEntToTabResult({ branchEnt: x })
            )
      ),
      Result.bind(
        'prodBranchBridges',
        (v): Result.ResultAsync<BridgeTab[], BridgeEntToTabError> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.branch.projectId),
                eq(bridgesTable.repoId, PROD_REPO_ID),
                eq(bridgesTable.branchId, v.branch.branchId)
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.bridgeEntToTabResult({ bridgeEnt: x })
              )
            )
      ),
      Result.bind('productionBranch', (v): Result.Result<BranchTab, never> => {
        let productionBranch: BranchTab = v.prodBranch;

        if (isUndefined(productionBranch)) {
          productionBranch = this.branchesService.makeBranch({
            projectId: v.projectId,
            repoId: PROD_REPO_ID,
            branchId: v.branchId
          });

          v.branchBridgeEnts.forEach(bridgeEnt => {
            let prodBranchBridge: BridgeTab = this.bridgesService.makeBridge({
              projectId: v.branch.projectId,
              repoId: PROD_REPO_ID,
              branchId: v.branch.branchId,
              envId: bridgeEnt.envId,
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
              > = await this.blockmlService.rebuildStructResult({
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
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        branches: [v.productionBranch],
                        bridges: [...v.prodBranchBridges]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'currentBridgeEnt',
        (v): Result.Result<BridgeEnt, never> =>
          Result.succeed(
            v.branchBridgeEnts.find(bridgeEnt => bridgeEnt.envId === v.envId)
          )
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.currentBridgeEnt.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsError> =>
          this.modelsService.getModelPartXsResult({
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
          needValidate: v.currentBridgeEnt.needValidate
        })
      )
    );
  }
}
