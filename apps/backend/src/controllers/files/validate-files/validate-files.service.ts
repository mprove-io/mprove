import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  MemberTab,
  ProjectTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import {
  BlockmlService,
  type RebuildStructOutput
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
import { makeId } from '#common/functions/make-id/make-id';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetMemberCheckIsEditorError } from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { ValidateFilesError } from '#common/types/backend/function-errors/validate-files-error';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendValidateFilesOutput } from '#common/types/backend/routes/files/validate-files/validate-files-output';
import type { ToDiskGetCatalogFilesOutput } from '#common/types/disk/routes/catalogs/get-catalog-files/get-catalog-files-output';

@Injectable()
export class ValidateFilesService {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async validateFilesResult(item: {
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
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorError> =>
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
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExists({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
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
        'diskGetCatalogFilesOutput',
        (v): Result.ResultAsync<ToDiskGetCatalogFilesOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
            request: {
              operation: 'getCatalogFiles',
              traceId: v.traceId,
              input: {
                baseProject: this.tabService.projectTabToBaseProject({
                  project: v.project
                }),
                repoId: v.repoId,
                branch: v.branchId
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
      Result.andThrough(v =>
        Result.sequence(
          v.branchBridgeEnts,
          async (bridgeEnt): Result.ResultAsync<void, RebuildStructError> => {
            if (bridgeEnt.envId === v.envId) {
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
                envId: bridgeEnt.envId,
                selectedGivens: [],
                overrideTimezone: undefined
              });

              if (Result.isFailure(result)) {
                return result;
              }

              bridgeEnt.structId = structId;
              bridgeEnt.needValidate = false;
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
                        bridges: [...v.branchBridgeEnts]
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
          this.structsService.getStructCheckExists({
            structId: v.currentBridgeEnt.structId,
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
        (v): ToBackendValidateFilesOutput => ({
          repo: v.diskGetCatalogFilesOutput.repo,
          needValidate: v.currentBridgeEnt.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          })
        })
      )
    );
  }
}
