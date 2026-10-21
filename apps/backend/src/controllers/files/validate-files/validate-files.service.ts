import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BridgeTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { makeId } from '#common/functions/make-id/make-id';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { ValidateFilesError } from '#common/types/backend/function-errors/validate-files-error';
import type { ToBackendValidateFilesOutput } from '#common/types/backend/routes/files/validate-files/validate-files-output';

@Injectable()
export class ValidateFilesService {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  async validateFiles(item: {
    traceId: string;
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Result.ResultAsync<ToBackendValidateFilesOutput, ValidateFilesError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
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
          memberId: v.userId
        })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
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
      Result.bind('diskGetCatalogFilesOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'getCatalogFiles',
            traceId: v.traceId,
            input: {
              baseProject: this.db.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId
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
        Result.sequence(
          v.branchBridges,
          async (
            bridge: BridgeTab
          ): Result.ResultAsync<void, RebuildStructError> => {
            if (bridge.envId === v.envId) {
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
                diskFiles: v.diskGetCatalogFilesOutput.files,
                mproveDir: v.diskGetCatalogFilesOutput.mproveDir,
                envId: bridge.envId,
                selectedGivens: [],
                overrideTimezone: undefined
              });

              if (Result.isFailure(result)) {
                return result;
              }

              bridge.structId = structId;
              bridge.needValidate = false;
            }

            return Result.succeed();
          }
        )
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
        (v): ToBackendValidateFilesOutput => ({
          repo: v.diskGetCatalogFilesOutput.repo,
          needValidate: v.currentBridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          })
        })
      )
    );
  }
}
