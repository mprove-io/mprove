import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';

@Injectable()
export class ConsumerService {
  constructor() {}

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
        throw Error(api.ErEnum.M_BLOCKML_WRONG_REQUEST_INFO_NAME);
      }

      return request.payload.structId;
    } catch (e) {
      return makeErrorResponse({ request: request, e: e });
    }
  }
}

function makeErrorResponse(item: { request: any; e: any }) {
  let info: api.ToBlockmlResponseInfo = {
    traceId: item.request.info?.traceId,
    status: api.ToBlockmlResponseInfoStatusEnum.InternalError,
    error: {
      message: item.e.message,
      at: item.e.stack?.split('\n')[1],
      stackArray: item.e.stack?.split('\n'),
      stack: item.e.stack,
      e: item.e
    }
  };

  return {
    info: info,
    payload: {}
  };
}
