import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';
import { api } from '../barrels/api';
import { DashboardService } from './dashboard.service';
import { QueryService } from './query.service';
import { StructService } from './struct.service';

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: StructService,
    private queryService: QueryService,
    private dashboardService: DashboardService
  ) {}

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MBlockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
    queue: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString()
  })
  async processDashboard(
    request: api.ToBlockmlProcessDashboardRequest,
    context: any
  ) {
    try {
      if (
        request.info?.name !==
        api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard
      ) {
        throw new api.ServerError({
          message: api.ErEnum.M_BLOCKML_WRONG_REQUEST_INFO_NAME
        });
      }

      let reqValid = await api.transformValid({
        classType: api.ToBlockmlProcessDashboardRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      let {
        structId,
        organizationId,
        projectId,
        weekStart,
        udfsDict,
        modelContents,
        dashboardContent,
        newDashboardId,
        newDashboardFields
      } = reqValid.payload;

      let payload = await this.dashboardService.processDashboard({
        traceId: reqValid.info.traceId,
        structId: structId,
        organizationId: organizationId,
        projectId: projectId,
        weekStart: weekStart,
        udfsDict: udfsDict,
        models: modelContents,
        dashboard: dashboardContent,
        newDashboardId: newDashboardId,
        newDashboardFields: newDashboardFields
      });

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MBlockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
    queue: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString()
  })
  async processQuery(request: api.ToBlockmlProcessQueryRequest, context: any) {
    try {
      if (
        request.info?.name !==
        api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessQuery
      ) {
        throw new api.ServerError({
          message: api.ErEnum.M_BLOCKML_WRONG_REQUEST_INFO_NAME
        });
      }

      let reqValid = await api.transformValid({
        classType: api.ToBlockmlProcessQueryRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      let {
        organizationId,
        projectId,
        weekStart,
        udfsDict,
        mconfig,
        modelContent
      } = reqValid.payload;

      let payload = await this.queryService.processQuery({
        traceId: reqValid.info.traceId,
        organizationId: organizationId,
        projectId: projectId,
        weekStart: weekStart,
        udfsDict: udfsDict,
        mconfig: mconfig,
        model: modelContent
      });

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MBlockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
    queue: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString()
  })
  async rebuildStruct(
    request: api.ToBlockmlRebuildStructRequest,
    context: any
  ) {
    try {
      if (
        request.info?.name !==
        api.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct
      ) {
        throw new api.ServerError({
          message: api.ErEnum.M_BLOCKML_WRONG_REQUEST_INFO_NAME
        });
      }

      let reqValid = await api.transformValid({
        classType: api.ToBlockmlRebuildStructRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      let {
        structId,
        organizationId,
        projectId,
        weekStart,
        files,
        connections
      } = reqValid.payload;

      let payload = await this.structService.wrapStruct({
        traceId: reqValid.info.traceId,
        structId: structId,
        organizationId: organizationId,
        projectId: projectId,
        weekStart: weekStart,
        files: files,
        connections: connections
      });

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }
}
