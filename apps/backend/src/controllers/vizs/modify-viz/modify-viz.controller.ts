import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { makeVizFileText } from '~backend/functions/make-viz-file-text';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { VizsService } from '~backend/services/vizs.service';

@Controller()
export class ModifyVizController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private vizsService: VizsService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyViz)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendModifyVizRequest)
    reqValid: apiToBackend.ToBackendModifyVizRequest
  ) {
    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      vizId,
      reportTitle,
      accessRoles,
      accessUsers,
      mconfig
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
      'firstProjectId'
    );

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID &&
      branchId === common.BRANCH_MASTER
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingViz = await this.vizsService.getVizCheckExists({
      structId: branch.struct_id,
      vizId: vizId
    });

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      member.is_editor === common.BoolEnum.FALSE
    ) {
      this.vizsService.checkVizPath({
        userAlias: user.alias,
        filePath: existingViz.file_path
      });
    }

    let mconfigModel = await this.modelsService.getModelCheckExists({
      structId: branch.struct_id,
      modelId: mconfig.modelId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: mconfigModel
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let vizFileText = makeVizFileText({
      mconfig: mconfig,
      reportTitle: reportTitle,
      roles: accessRoles,
      users: accessUsers,
      vizId: vizId
    });

    let toDiskSaveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingViz.file_path,
        userAlias: user.alias,
        content: vizFileText
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskSaveFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
        checkIsOk: true
      }
    );

    let {
      struct,
      dashboards,
      vizs,
      mconfigs,
      queries,
      models
    } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    let viz = vizs.find(x => x.vizId === vizId);

    if (common.isUndefined(viz)) {
      let fileIdAr = existingViz.file_path.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MODIFY_VIZ_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let vizReport = viz.reports[0];
    let vizMconfig = mconfigs.find(x => x.mconfigId === vizReport.mconfigId);
    let vizQuery = queries.find(x => x.queryId === vizReport.queryId);

    await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: [wrapper.wrapToEntityMconfig(vizMconfig)],
        queries: [wrapper.wrapToEntityQuery(vizQuery)]
      }
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        vizs: [wrapper.wrapToEntityViz(viz)],
        structs: [struct]
      }
    });

    let payload = {};

    return payload;
  }
}
