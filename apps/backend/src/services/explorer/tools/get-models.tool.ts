import { Inject, Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { StructsService } from '#backend/services/db/structs.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '#common/zod/to-disk/04-catalogs/to-disk-get-catalog-files';

@Injectable()
export class GetModelsToolService {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeTool(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    traceId: string;
  }): Tool {
    let { user, projectId, repoId, branchId, envId, traceId } = item;

    return tool({
      description:
        'Get models by model id. Returns model metadata, fields, and the top source Malloy file content.',
      inputSchema: z.object({
        modelIds: z
          .array(z.string())
          .describe('Model ids to retrieve, e.g. ["orders", "customers"].')
      }),
      execute: async input => {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: projectId
        });

        let userMember = await this.membersService.getMemberCheckExists({
          projectId: projectId,
          memberId: user.userId
        });

        await this.envsService.getEnvCheckExistsAndAccess({
          projectId: projectId,
          envId: envId,
          member: userMember
        });

        let bridge = await this.bridgesService.getBridgeCheckExists({
          projectId: projectId,
          repoId: repoId,
          branchId: branchId,
          envId: envId
        });

        let struct = await this.structsService.getStructCheckExists({
          structId: bridge.structId,
          projectId: projectId
        });

        let modelTabs = await this.db.drizzle.query.modelsTable
          .findMany({
            where: eq(modelsTable.structId, struct.structId)
          })
          .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

        let requestedModelIds = new Set(input.modelIds);
        let models = modelTabs
          .map(model =>
            this.modelsService.tabToApi({
              model: model,
              hasAccess: checkModelAccess({
                member: userMember,
                modelAccessRoles: model.accessRoles
              })
            })
          )
          .filter(model => model.hasAccess === true)
          .filter(model => requestedModelIds.has(model.modelId));

        let baseProject = this.tabService.projectTabToBaseProject({
          project: project
        });

        let request: ToDiskGetCatalogFilesRequest = {
          info: {
            name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
            traceId: traceId
          },
          payload: {
            orgId: project.orgId,
            baseProject: baseProject,
            repoId: repoId,
            branch: branchId
          }
        };

        let response =
          await this.rpcService.sendToDisk<ToDiskGetCatalogFilesResponse>({
            orgId: project.orgId,
            projectId: projectId,
            repoId: repoId,
            message: request,
            checkIsOk: true
          });

        let catalogFiles = response.payload.files.filter(file =>
          file.pathString.endsWith('.malloy')
        );

        return {
          structId: struct.structId,
          models: models.map(model => {
            let catalogFile = catalogFiles.find(file => {
              let left = model.filePath;
              let right = file.pathString;

              return (
                left === right ||
                left.endsWith(`/${right}`) ||
                right.endsWith(`/${left}`)
              );
            });

            let malloySource =
              model.type === ModelTypeEnum.Malloy
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
        };
      }
    });
  }
}
