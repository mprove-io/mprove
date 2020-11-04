import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';

@Injectable()
export class ConsumerService {
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

      let requestValid = await api.transformValid({
        classType: api.ToBlockmlProcessDashboardRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      let response = requestValid.payload.structId;

      return response;
    } catch (e) {
      return api.makeErrorResponse({ request: request, e: e });
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

      let requestValid = await api.transformValid({
        classType: api.ToBlockmlProcessQueryRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      let response = requestValid.payload.structId;

      return response;
    } catch (e) {
      return api.makeErrorResponse({ request: request, e: e });
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

      let requestValid = await api.transformValid({
        classType: api.ToBlockmlRebuildStructRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      let response = requestValid.payload.structId;

      return response;
    } catch (e) {
      return api.makeErrorResponse({ request: request, e: e });
    }
  }
}
