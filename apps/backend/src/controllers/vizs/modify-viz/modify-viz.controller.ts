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
import { VizsRepository } from '~backend/models/store-repositories/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { VizsService } from '~backend/services/vizs.service';

@Controller()
export class ModifyVizController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private vizsService: VizsService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private vizsRepository: VizsRepository,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private envsService: EnvsService,
    private bridgesService: BridgesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyViz)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendModifyVizRequest)
    reqValid: apiToBackend.ToBackendModifyVizRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
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

    if (member.is_explorer === common.BoolEnum.FALSE) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
      'firstProjectId'
    );

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingViz = await this.vizsService.getVizCheckExists({
      structId: bridge.struct_id,
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
      structId: bridge.struct_id,
      modelId: mconfig.modelId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: mconfigModel
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let vizFileText = makeVizFileText({
      mconfig: mconfig,
      reportTitle: reportTitle,
      roles: accessRoles,
      users: accessUsers,
      vizId: vizId,
      defaultTimezone: currentStruct.default_timezone
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
        content: vizFileText,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
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
      structId: bridge.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true,
      envId: envId
    });

    let viz = vizs.find(x => x.vizId === vizId);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        vizs: common.isDefined(viz)
          ? [wrapper.wrapToEntityViz(viz)]
          : undefined,
        structs: [struct]
      }
    });

    if (common.isUndefined(viz)) {
      await this.vizsRepository.delete({
        viz_id: vizId,
        struct_id: bridge.struct_id
      });

      let fileIdAr = existingViz.file_path.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MODIFY_VIZ_FAIL,
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

    let payload = {};

    return payload;
  }
}
