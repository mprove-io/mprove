import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
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
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class CreateVizController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private modelsRepository: repositories.ModelsRepository,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateVizRequest)
    reqValid: apiToBackend.ToBackendCreateVizRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

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

    if (member.is_explorer === common.BoolEnum.FALSE) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: branch.struct_id
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
      vizId: vizId,
      defaultTimezone: currentStruct.default_timezone
    });

    let parentNodeId = `${projectId}/${common.FILES_USERS_FOLDER}/${user.alias}`;
    let fileName = `${vizId}${common.FileExtensionEnum.Viz}`;

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: vizFileText
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      }
    );

    let {
      dashboards,
      vizs,
      mconfigs,
      queries,
      models,
      struct
    } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    let viz = vizs.find(x => x.vizId === vizId);

    // console.log('struct');
    // console.log(struct);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        structs: [struct]
      }
    });

    if (common.isUndefined(viz)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_CREATE_VIZ_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let vizReport = viz.reports[0];
    let vizMconfig = mconfigs.find(x => x.mconfigId === vizReport.mconfigId);
    let vizQuery = queries.find(x => x.queryId === vizReport.queryId);

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        vizs: [wrapper.wrapToEntityViz(viz)],
        mconfigs: [wrapper.wrapToEntityMconfig(vizMconfig)],
        queries: [wrapper.wrapToEntityQuery(vizQuery)]
      }
    });

    let modelsEntities = await this.modelsRepository.find({
      select: ['model_id', 'access_users', 'access_roles', 'hidden'],
      where: { struct_id: branch.struct_id }
    });

    let payload: apiToBackend.ToBackendCreateVizResponsePayload = {
      viz: wrapper.wrapToApiViz({
        viz: records.vizs[0],
        mconfigs: [],
        queries: [],
        member: wrapper.wrapToApiMember(member),
        models: modelsEntities.map(model =>
          wrapper.wrapToApiModel({
            model: model,
            hasAccess: helper.checkAccess({
              userAlias: user.alias,
              member: member,
              vmd: model
            })
          })
        ),
        isAddMconfigAndQuery: false
      })
    };

    return payload;
  }
}
