import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendMoveCatalogNodeRequestDto,
  ToBackendMoveCatalogNodeResponseDto
} from '#backend/controllers/catalogs/move-catalog-node/move-catalog-node.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetMemberCheckIsEditorError } from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendMoveCatalogNodeOutput } from '#common/types/backend/routes/catalogs/move-catalog-node/move-catalog-node-output';
import type { ToDiskMoveCatalogNodeOutput } from '#common/types/disk/routes/catalogs/move-catalog-node/move-catalog-node-output';

@ApiTags('Catalogs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class MoveCatalogNodeController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private blockmlService: BlockmlService,
    private sessionsService: SessionsService,
    private rpcService: RpcService,
    private db: DbService
  ) {}

  @Post('api/ToBackendMoveCatalogNode' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'MoveCatalogNode',
    description:
      'Move a file or folder to a different location in the catalog tree'
  })
  @ApiOkResponse({ type: ToBackendMoveCatalogNodeResponseDto })
  async moveCatalogNode(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendMoveCatalogNodeRequestDto
  ): Promise<BackendResultForOperation<'moveCatalogNode'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        fromNodeId: body.input.fromNodeId,
        toNodeId: body.input.toNodeId,
        traceId: body.traceId,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: false
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorError> =>
          this.membersService.getMemberCheckIsEditor({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
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
      Result.bind(
        'diskMoveCatalogNodeOutput',
        (v): Result.ResultAsync<ToDiskMoveCatalogNodeOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
            request: {
              operation: 'moveCatalogNode',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                repoId: v.repoId,
                branch: v.branchId,
                fromNodeId: v.fromNodeId,
                toNodeId: v.toNodeId
              }
            }
          })
      ),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], BridgeEntToTabError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.branch.projectId),
              eq(bridgesTable.repoId, v.branch.repoId),
              eq(bridgesTable.branchId, v.branch.branchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.blockmlService.rebuildBranchBridges({
          branchBridges: v.branchBridges,
          envId: v.envId,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskMoveCatalogNodeOutput.files,
          mproveDir: v.diskMoveCatalogNodeOutput.mproveDir
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: { bridges: [...v.branchBridges] }
        })
      ),
      Result.bind(
        'currentBridge',
        (v): Result.Result<BridgeTab, never> =>
          Result.succeed(
            v.branchBridges.find(bridge => bridge.envId === v.envId)
          )
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExists({
            structId: v.currentBridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsError> =>
          this.modelsService.getModelPartXs({
            structId: v.struct.structId,
            apiUserMember: this.membersService.tabToApi({
              member: v.userMember
            })
          })
      ),
      Result.map(
        (v): ToBackendMoveCatalogNodeOutput => ({
          repo: v.diskMoveCatalogNodeOutput.repo,
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
