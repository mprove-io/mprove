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
import { ServerError } from '#common/classes/server-error/server-error';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetMemberCheckIsEditorResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-result-error';
import type { GetModelPartXsResultError } from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { RebuildStructResultError } from '#common/types/backend/function-errors/rebuild-struct-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
import type { ValidateFilesResultError } from '#common/types/backend/function-errors/validate-files-result-error';
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

  async validateFiles(item: {
    traceId: string;
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Promise<ToBackendValidateFilesOutput> {
    let result: Result.Result<
      ToBackendValidateFilesOutput,
      ValidateFilesResultError
    > = await this.validateFilesResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        originalError:
          'originalError' in result.error && result.error.originalError
            ? Object.assign(new Error(result.error.originalError.code), {
                displayData:
                  'displayData' in result.error.originalError
                    ? result.error.originalError.displayData
                    : undefined
              })
            : undefined
      });
    }

    let payload: ToBackendValidateFilesOutput = result.value;

    return payload;
  }

  async validateFilesResult(item: {
    traceId: string;
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Result.ResultAsync<
    ToBackendValidateFilesOutput,
    ValidateFilesResultError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsEditorResultError> =>
          this.membersService.getMemberCheckIsEditorResult({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
        })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
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
        'diskGetCatalogFilesOutput',
        (
          v
        ): Result.ResultAsync<
          ToDiskGetCatalogFilesOutput,
          SendToDiskResultError
        > =>
          this.rpcService.sendToDiskResult({
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
          async (
            bridgeEnt
          ): Result.ResultAsync<void, RebuildStructResultError> => {
            if (bridgeEnt.envId === v.envId) {
              let structId: string = makeId();

              let result: Result.Result<
                RebuildStructResultValue,
                RebuildStructResultError
              > = await this.blockmlService.rebuildStructResult({
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
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.currentBridgeEnt.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsResultError> =>
          this.modelsService.getModelPartXsResult({
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
