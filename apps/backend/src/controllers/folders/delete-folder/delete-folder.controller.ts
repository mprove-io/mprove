import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendDeleteFolderRequestDto,
  ToBackendDeleteFolderResponseDto
} from '#backend/controllers/folders/delete-folder/delete-folder.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
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
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteFolderOutput } from '#common/types/backend/routes/folders/delete-folder/delete-folder-output';

@ApiTags('Folders')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteFolderController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private sessionsService: SessionsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteFolder' satisfies ToBackendRoute)
  @ApiOperation({ summary: 'DeleteFolder', description: 'Delete a folder' })
  @ApiOkResponse({ type: ToBackendDeleteFolderResponseDto })
  async deleteFolder(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteFolderRequestDto
  ): Promise<BackendResultForOperation<'deleteFolder'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        folderNodeId: body.input.folderNodeId,
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
      Result.andThrough(v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('diskDeleteFolderOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'deleteFolder',
            traceId: v.traceId,
            input: {
              baseProject: this.tabService.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              folderNodeId: v.folderNodeId
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
      Result.andThrough(v =>
        this.blockmlService.rebuildBranchBridges({
          branchBridges: v.branchBridges,
          envId: v.envId,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskDeleteFolderOutput.files,
          mproveDir: v.diskDeleteFolderOutput.mproveDir
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: { bridges: [...v.branchBridges] }
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
        (v): ToBackendDeleteFolderOutput => ({
          repo: v.diskDeleteFolderOutput.repo,
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
