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
        throw new api.ServerError({
          message: api.ErEnum.M_BLOCKML_WRONG_REQUEST_INFO_NAME
        });
      }

      let requestValid = await api.transformValid({
        classType: api.ToBlockmlRebuildStructRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WRONG_REQUEST_PARAMS
      });

      return requestValid.payload.structId;
    } catch (e) {
      return api.makeErrorResponse({ request: request, e: e });
    }
  }
}
