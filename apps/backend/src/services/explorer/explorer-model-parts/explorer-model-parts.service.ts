import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { DbService } from '#backend/services/db/db.service';
import type { ExplorerModelPart } from '#backend/services/explorer/types/explorer-model-part';
import type {
  ExplorerModel,
  GetExplorerModelsOutput
} from '#backend/services/explorer/types/get-explorer-models-output';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetExplorerModelPartsError } from '#common/types/backend/function-errors/get-explorer-model-parts-error';
import type { GetExplorerModelsError } from '#common/types/backend/function-errors/get-explorer-models-error';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

@Injectable()
export class ExplorerModelPartsService {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>
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
      Result.andThen(v =>
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
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
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
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.projectId),
            eq(bridgesTable.repoId, v.repoId),
            eq(bridgesTable.branchId, v.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('struct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.struct.structId)
        })
      ),
      Result.bind('requestedModelIdSet', v =>
        Result.succeed(
          isUndefined(v.modelIds) ? undefined : new Set(v.modelIds)
        )
      ),
      Result.bind('apiModels', v =>
        Result.succeed(
          v.models
            .map(model =>
              modelTabToApi({
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
      Result.bind('diskGetCatalogFilesOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'getCatalogFiles',
            traceId: v.traceId,
            input: {
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId
            }
          }
        })
      ),
      Result.bind('catalogFiles', v =>
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
