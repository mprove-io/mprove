import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class CreateTempMconfigAndQueryController {
  constructor(
    private dbService: DbService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private queriesRepository: repositories.QueriesRepository
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfigAndQuery
  )
  async createTempMconfigAndQuery(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateTempMconfigAndQueryRequest)
    reqValid: apiToBackend.ToBackendCreateTempMconfigAndQueryRequest
  ) {
    let { traceId } = reqValid.info;
    let { mconfig, projectId, isRepoProd, branchId } = reqValid.payload;

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

    let struct = await this.structsService.getStructCheckExists({
      structId: branch.struct_id
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: branch.struct_id,
      modelId: mconfig.modelId
    });

    if (mconfig.structId !== branch.struct_id) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: model
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let toBlockmlProcessQueryRequest: apiToBlockml.ToBlockmlProcessQueryRequest = {
      info: {
        name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery,
        traceId: traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: project.project_id,
        weekStart: struct.week_start,
        udfsDict: struct.udfs_dict,
        mconfig: mconfig,
        modelContent: model.content
      }
    };

    let blockmlProcessQueryResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlProcessQueryResponse>(
      {
        routingKey: common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
        message: toBlockmlProcessQueryRequest,
        checkIsOk: true
      }
    );

    let newMconfig = blockmlProcessQueryResponse.payload.mconfig;
    let newQuery = blockmlProcessQueryResponse.payload.query;

    let query = await this.queriesRepository.findOne({
      query_id: newQuery.queryId
    });

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: [wrapper.wrapToEntityMconfig(newMconfig)],
        queries: common.isDefined(query)
          ? []
          : [wrapper.wrapToEntityQuery(newQuery)]
      }
    });

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryResponsePayload = {
      mconfig: wrapper.wrapToApiMconfig({
        mconfig: records.mconfigs[0],
        modelFields: model.fields
      }),
      query: common.isDefined(query)
        ? wrapper.wrapToApiQuery(query)
        : wrapper.wrapToApiQuery(records.queries[0])
    };

    return payload;
  }
}
