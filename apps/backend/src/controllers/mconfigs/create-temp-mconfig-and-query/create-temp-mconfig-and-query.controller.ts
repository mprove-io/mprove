import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class CreateTempMconfigAndQueryController {
  constructor(
    private connection: Connection,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService
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
    let { mconfig } = reqValid.payload;

    let struct = await this.structsService.getStructCheckExists({
      structId: mconfig.structId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: struct.project_id
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: struct.project_id,
      memberId: user.user_id
    });

    let model = await this.modelsService.getModelCheckExists({
      modelId: mconfig.modelId,
      structId: mconfig.structId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      memberRoles: member.roles,
      vmd: model
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_MODEL
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

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.addRecords({
        manager: manager,
        records: {
          mconfigs: [wrapper.wrapToEntityMconfig(newMconfig)],
          queries: [wrapper.wrapToEntityQuery(newQuery)]
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryResponsePayload = {
      mconfig: wrapper.wrapToApiMconfig(records.mconfigs[0]),
      query: wrapper.wrapToApiQuery(records.queries[0])
    };

    return payload;
  }
}
