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
  ToBackendRenameCatalogNodeRequestDto,
  ToBackendRenameCatalogNodeResponseDto
} from '#backend/controllers/catalogs/rename-catalog-node/rename-catalog-node.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  BlockmlService,
  type RebuildStructResultValue
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetMemberCheckIsEditorResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-result-error';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { RebuildStructResultError } from '#common/types/backend/function-errors/rebuild-struct-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRenameCatalogNodeOutput } from '#common/types/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-output';
import type { ToDiskRenameCatalogNodeOutput } from '#common/types/disk/routes/catalogs/rename-catalog-node/rename-catalog-node-output';

@ApiTags('Catalogs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RenameCatalogNodeController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private sessionsService: SessionsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendRenameCatalogNode' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'RenameCatalogNode',
    description: 'Rename a file or folder in the catalog tree'
  })
  @ApiOkResponse({ type: ToBackendRenameCatalogNodeResponseDto })
  async renameCatalogNode(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRenameCatalogNodeRequestDto
  ): Promise<BackendResultForOperation<'renameCatalogNode'>> {
    return Result.pipe(
      Result.succeed({
        ...body.input,
        traceId: body.traceId,
        user: user,
        sessionsService: this.sessionsService,
        projectsService: this.projectsService,
        membersService: this.membersService,
        branchesService: this.branchesService,
        envsService: this.envsService,
        tabService: this.tabService,
        rpcService: this.rpcService,
        blockmlService: this.blockmlService,
        structsService: this.structsService,
        modelsService: this.modelsService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: false
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          v.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorResultError> =>
          v.membersService.getMemberCheckIsEditorResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          v.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        v.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'diskRenameCatalogNodeOutput',
        (
          v
        ): Result.ResultAsync<
          ToDiskRenameCatalogNodeOutput,
          SendToDiskResultError
        > =>
          v.rpcService.sendToDiskResult({
            request: {
              operation: 'renameCatalogNode',
              traceId: v.traceId,
              input: {
                baseProject: v.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                repoId: v.repoId,
                branch: v.branchId,
                nodeId: v.nodeId,
                newName: v.newName.toLowerCase()
              }
            }
          })
      ),
      Result.bind(
        'branchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          v.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.branch.projectId),
                eq(bridgesTable.repoId, v.branch.repoId),
                eq(bridgesTable.branchId, v.branch.branchId)
              )
            })
            .then(branchBridgeEnts => Result.succeed(branchBridgeEnts))
      ),
      Result.andThrough(v =>
        Result.sequence(
          v.branchBridgeEnts,
          async (
            bridgeEnt
          ): Result.ResultAsync<void, RebuildStructResultError> => {
            if (bridgeEnt.envId === v.envId) {
              let structId: string = makeId();

              let result: Result.Result<
                RebuildStructResultValue,
                RebuildStructResultError
              > = await v.blockmlService.rebuildStructResult({
                traceId: v.traceId,
                orgId: v.project.orgId,
                projectId: v.projectId,
                repoId: v.repoId,
                structId: structId,
                diskFiles: v.diskRenameCatalogNodeOutput.files,
                mproveDir: v.diskRenameCatalogNodeOutput.mproveDir,
                envId: bridgeEnt.envId,
                selectedGivens: [],
                overrideTimezone: undefined
              });

              if (Result.isFailure(result)) {
                return result;
              }

              bridgeEnt.structId = structId;
              bridgeEnt.needValidate = false;
            } else {
              bridgeEnt.structId = EMPTY_STRUCT_ID;
              bridgeEnt.needValidate = true;
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
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { bridges: [...v.branchBridgeEnts] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> => {
          let currentBridgeEnt: BridgeEnt = v.branchBridgeEnts.find(
            bridgeEnt => bridgeEnt.envId === v.envId
          );

          return v.structsService.getStructCheckExistsResult({
            structId: currentBridgeEnt.structId,
            projectId: v.projectId
          });
        }
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsResultError> =>
          v.modelsService.getModelPartXsResult({
            structId: v.struct.structId,
            apiUserMember: v.membersService.tabToApi({ member: v.userMember })
          })
      ),
      Result.map((v): ToBackendRenameCatalogNodeOutput => {
        let currentBridgeEnt: BridgeEnt = v.branchBridgeEnts.find(
          bridgeEnt => bridgeEnt.envId === v.envId
        );

        let payload: ToBackendRenameCatalogNodeOutput = {
          repo: v.diskRenameCatalogNodeOutput.repo,
          struct: v.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          needValidate: currentBridgeEnt.needValidate
        };

        return payload;
      })
    );
  }
}
