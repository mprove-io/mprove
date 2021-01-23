import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { barSpecial } from '../barrels/bar-special';
import { api } from '../barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../barrels/interfaces';

@Injectable()
export class ConsumerWorkerService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

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

      let reqValid = await api.transformValid({
        classType: api.ToBlockmlWorkerGenSqlRequest,
        object: request,
        errorMessage: api.ErEnum.M_BLOCKML_WORKER_WRONG_REQUEST_PARAMS
      });

      let payload = barSpecial.genSqlPro(request.payload);

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }
}
