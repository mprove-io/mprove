import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSaveFileRequestDto,
  ToBackendSaveFileResponseDto
} from '#backend/controllers/files/save-file/save-file.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { rebuildBlockmlBranchBridges } from '#backend/functions/blockml/rebuild-blockml-branch-bridges/rebuild-blockml-branch-bridges';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditor } from '#backend/functions/db/members/get-member-check-is-editor/get-member-check-is-editor';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveFileOutput } from '#common/types/backend/routes/files/save-file/save-file-output';

@ApiTags('Files')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveFileController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  @Post('api/ToBackendSaveFile' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SaveFile',
    description: 'Save file changes'
  })
  @ApiOkResponse({
    type: ToBackendSaveFileResponseDto
  })
  async saveFile(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSaveFileRequestDto
  ): Promise<BackendResultForOperation<'saveFile'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        fileNodeId: body.input.fileNodeId,
        content: body.input.content,
        traceId: body.traceId,
        user: user
      }),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: false,
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
      Result.bind('diskSaveFileOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'saveFile',
            traceId: v.traceId,
            input: {
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.fileNodeId,
              userAlias: v.user.alias,
              content: v.content
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
        rebuildBlockmlBranchBridges({
          branchBridges: v.branchBridges,
          envId: v.envId,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskSaveFileOutput.files,
          mproveDir: v.diskSaveFileOutput.mproveDir,
          db: this.db,
          tabService: this.tabService,
          rpcService: this.rpcService,
          cs: this.cs,
          logger: this.logger
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            bridges: [...v.branchBridges]
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
        (v): ToBackendSaveFileOutput => ({
          repo: v.diskSaveFileOutput.repo,
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
