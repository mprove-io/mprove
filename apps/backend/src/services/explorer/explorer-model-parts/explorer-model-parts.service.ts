import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  BridgeTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { ExplorerModelPart } from '#backend/services/explorer/types/explorer-model-part';
import type {
  ExplorerModel,
  GetExplorerModelsOutput
} from '#backend/services/explorer/types/get-explorer-models-output';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetExplorerModelPartsError } from '#common/types/backend/function-errors/get-explorer-model-parts-error';
import type { GetExplorerModelsError } from '#common/types/backend/function-errors/get-explorer-models-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { ToDiskGetCatalogFilesOutput } from '#common/types/disk/routes/catalogs/get-catalog-files/get-catalog-files-output';

@Injectable()
export class ExplorerModelPartsService {
  constructor(
    private envsService: EnvsService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private tabService: TabService,
    private db: DbService
  ) {}

  async getExplorerModelParts(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    traceId: string;
  }): Result.ResultAsync<ExplorerModelPart[], GetExplorerModelPartsError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          GetExplorerModelsOutput,
          GetExplorerModelsError
        > =>
          this.getExplorerModels({
            userId: v.userId,
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId,
            traceId: v.traceId
          })
      ),
      Result.map((v): ExplorerModelPart[] =>
        v.models.map(model => ({
          modelId: model.modelId,
          label: model.label,
          type: model.type,
          connectionId: model.connectionId,
          connectionType: model.connectionType,
          malloySource: model.malloySource
        }))
      )
    );
  }

  async getExplorerModels(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    traceId: string;
    modelIds?: string[];
  }): Result.ResultAsync<GetExplorerModelsOutput, GetExplorerModelsError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.userId),
              eq(membersTable.projectId, v.projectId)
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
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.db.bridges.findFirstCheckExists({
            where: and(
              eq(bridgesTable.projectId, v.projectId),
              eq(bridgesTable.repoId, v.repoId),
              eq(bridgesTable.branchId, v.branchId),
              eq(bridgesTable.envId, v.envId)
            )
          })
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExists({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.models.findMany({
            where: eq(modelsTable.structId, v.struct.structId)
          })
      ),
      Result.bind(
        'requestedModelIdSet',
        (v): Result.Result<Set<string>, never> =>
          Result.succeed(
            isUndefined(v.modelIds) ? undefined : new Set(v.modelIds)
          )
      ),
      Result.bind(
        'apiModels',
        (v): Result.Result<ModelX[], never> =>
          Result.succeed(
            v.models
              .map(model =>
                this.modelsService.tabToApi({
                  model: model,
                  hasAccess: checkModelAccess({
                    member: v.userMember,
                    modelAccessRoles: model.accessRolesCombined
                  })
                })
              )
              .filter(model => model.hasAccess === true)
              .filter(model =>
                isUndefined(v.requestedModelIdSet)
                  ? true
                  : v.requestedModelIdSet.has(model.modelId)
              )
          )
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
        'catalogFiles',
        (v): Result.Result<DiskCatalogFile[], never> =>
          Result.succeed(
            v.diskGetCatalogFilesOutput.files.filter(file =>
              file.pathString.endsWith('.malloy')
            )
          )
      ),
      Result.map(
        (v): GetExplorerModelsOutput => ({
          structId: v.struct.structId,
          models: v.apiModels.map((model): ExplorerModel => {
            let catalogFile: DiskCatalogFile = v.catalogFiles.find(file => {
              let left: string = model.filePath;

              let right: string = file.pathString;

              return (
                left === right ||
                left.endsWith(`/${right}`) ||
                right.endsWith(`/${left}`)
              );
            });

            let malloySource: ExplorerModelPart['malloySource'] =
              model.type === 'Malloy'
                ? {
                    source: model.source,
                    filePath: catalogFile?.pathString ?? model.filePath,
                    fileText: catalogFile?.content ?? model.fileText
                  }
                : undefined;

            return {
              modelId: model.modelId,
              label: model.label,
              type: model.type,
              connectionId: model.connectionId,
              connectionType: model.connectionType,
              malloySource: malloySource,
              fields: model.fields
            };
          })
        })
      )
    );
  }
}
