import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BranchesService } from '#backend/services/db/branches.service';
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
import type { ExplorerModelPart } from './types/explorer-model-part';

@Injectable()
export class ExplorerModelPartsService {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getExplorerModelParts(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    traceId: string;
  }): Promise<ExplorerModelPart[]> {
    let { userId, projectId, repoId, branchId, envId, traceId } = item;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
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
      .filter(model => model.hasAccess === true);

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

    return models.map(model => {
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
        malloySource: malloySource
      };
    });
  }
}
