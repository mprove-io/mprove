import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSyncRepoRequestDto,
  ToBackendSyncRepoResponseDto
} from '#backend/controllers/repos/sync-repo/sync-repo.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { rebuildBranchBridges } from '#backend/functions/blockml/rebuild-branch-bridges/rebuild-branch-bridges';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditor } from '#backend/functions/db/members/get-member-check-is-editor/get-member-check-is-editor';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSyncRepoOutput } from '#common/types/backend/routes/repos/sync-repo/sync-repo-output';

@ApiTags('Repos')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SyncRepoController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  @Post('api/ToBackendSyncRepo' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SyncRepo',
    description: `Sync local git repo state with server git repo state`
  })
  @ApiOkResponse({
    type: ToBackendSyncRepoResponseDto
  })
  async syncRepo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSyncRepoRequestDto
  ): Promise<BackendResultForOperation<'syncRepo'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        lastCommit: body.input.lastCommit,
        envId: body.input.envId,
        getRepo: body.input.getRepo === true,
        getRepoNodes: body.input.getRepoNodes === true,
        getErrors: body.input.getErrors === true,
        debug: body.input.debug === true,
        traceId: body.traceId,
        user: user,
        input: body.input
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
      Result.bind('diskSyncRepoOutput', v =>
        this.rpcService.sendToDisk({
          request:
            v.input.direction === 'to-server'
              ? {
                  operation: 'syncRepo',
                  traceId: v.traceId,
                  input: {
                    direction: 'to-server',
                    baseProject: projectTabToBaseProject({
                      tabService: this.tabService,
                      project: v.project
                    }),
                    repoId: v.repoId,
                    branch: v.branchId,
                    lastCommit: v.lastCommit,
                    getRepo: v.getRepo,
                    getRepoNodes: v.getRepoNodes,
                    changedFiles: v.input.changedFiles,
                    deletedFiles: v.input.deletedFiles
                  }
                }
              : {
                  operation: 'syncRepo',
                  traceId: v.traceId,
                  input: {
                    direction: 'from-server',
                    baseProject: projectTabToBaseProject({
                      tabService: this.tabService,
                      project: v.project
                    }),
                    repoId: v.repoId,
                    branch: v.branchId,
                    lastCommit: v.lastCommit,
                    getRepo: v.getRepo,
                    getRepoNodes: v.getRepoNodes
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
        rebuildBranchBridges({
          branchBridges: v.branchBridges,
          envId: v.envId,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          diskFiles: v.diskSyncRepoOutput.files,
          mproveDir: v.diskSyncRepoOutput.mproveDir,
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
      Result.map((v): ToBackendSyncRepoOutput => {
        let basePayload = {
          orgId: v.project.orgId,
          repoId: v.repoId,
          validationErrorsTotal: v.struct.errors.length,
          validationErrors: v.getErrors === true ? v.struct.errors : undefined,
          devChangesToCommit: v.diskSyncRepoOutput.devChangesToCommit,
          syncRepo:
            v.getRepo === true ? v.diskSyncRepoOutput.syncRepo : undefined,
          needValidate:
            v.debug === true ? v.currentBridge.needValidate : undefined,
          structId: v.debug === true ? v.struct.structId : undefined
        };

        let payload: ToBackendSyncRepoOutput;

        if (v.diskSyncRepoOutput.direction === 'from-server') {
          payload = {
            direction: 'from-server',
            ...basePayload,
            changedFiles: v.diskSyncRepoOutput.changedFiles,
            deletedFiles: v.diskSyncRepoOutput.deletedFiles
          };
        } else {
          payload = {
            direction: 'to-server',
            ...basePayload,
            appliedChangesOnServer: v.diskSyncRepoOutput.appliedChangesOnServer
          };
        }

        return payload;
      })
    );
  }
}
