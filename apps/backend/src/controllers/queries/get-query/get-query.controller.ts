import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DashboardsService } from '~backend/services/dashboards.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { QueriesService } from '~backend/services/queries.service';
import { StructsService } from '~backend/services/structs.service';
import { VizsService } from '~backend/services/vizs.service';

@Controller()
export class GetQueryController {
  constructor(
    private queriesService: QueriesService,
    private modelsService: ModelsService,
    private vizsService: VizsService,
    private dashboardsService: DashboardsService,
    private membersService: MembersService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  async getQuery(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetQueryRequest)
    reqValid: apiToBackend.ToBackendGetQueryRequest
  ) {
    let { queryId, mconfigId, vizId, dashboardId } = reqValid.payload;

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      mconfigId: mconfigId
    });

    if (mconfig.query_id !== queryId) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_MCONFIG_QUERY_ID_MISMATCH
      });
    }

    let struct = await this.structsService.getStructCheckExists({
      structId: mconfig.struct_id
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: struct.project_id,
      memberId: user.user_id
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: mconfig.struct_id,
      modelId: mconfig.model_id
    });

    let viz;
    if (common.isDefined(vizId)) {
      viz = await this.vizsService.getVizCheckExists({
        structId: mconfig.struct_id,
        vizId: vizId
      });
    }

    let dashboard;
    if (common.isDefined(dashboardId)) {
      viz = await this.dashboardsService.getDashboardCheckExists({
        structId: mconfig.struct_id,
        dashboardId: dashboardId
      });
    }

    let isAccessGranted = common.isDefined(viz)
      ? helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: viz
        })
      : common.isDefined(dashboard)
      ? helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: dashboard
        })
      : helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: model,
          checkExplorer: true
        });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.isDefined(viz)
          ? apiToBackend.ErEnum.BACKEND_FORBIDDEN_VIZ
          : common.isDefined(dashboard)
          ? apiToBackend.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
          : apiToBackend.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let query = await this.queriesService.getQueryCheckExists({
      queryId: queryId
    });

    let payload: apiToBackend.ToBackendGetQueryResponsePayload = {
      query: wrapper.wrapToApiQuery(query)
    };

    return payload;
  }
}
