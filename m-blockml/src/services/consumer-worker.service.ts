import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { genSqlPro } from '../models/special/gen-sql';
import { api } from '../barrels/api';

@Injectable()
export class ConsumerWorkerService {
  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MBlockmlWorker.toString(),
    routingKey: api.RabbitBlockmlWorkerRoutingEnum.GenSql.toString(),
    queue: api.RabbitBlockmlWorkerRoutingEnum.GenSql.toString()
  })
  async genSql(request: api.ToBlockmlWorkerGenSqlRequest, context: any) {
    try {
      if (
        request.info?.name !==
        api.ToBlockmlWorkerRequestInfoNameEnum.ToBlockmlWorkerGenSql
      ) {
        throw new api.ServerError({
          message: api.ErEnum.M_BLOCKML_WORKER_WRONG_REQUEST_INFO_NAME
        });
      }

      let requestValid = await api.transformValid({
        classType: api.ToBlockmlWorkerGenSqlRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WORKER_WRONG_REQUEST_PARAMS
      });

      let { traceId } = requestValid.info;

      let outcome = genSqlPro(request.payload);

      let response: api.ToBlockmlWorkerGenSqlResponse = {
        info: {
          status: api.ResponseInfoStatusEnum.Ok,
          traceId: traceId
        },
        payload: outcome
      };

      return response;
    } catch (e) {
      return api.makeErrorResponse({ request: request, e: e });
    }
  }
}
