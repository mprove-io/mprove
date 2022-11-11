import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { GenSqlService } from '~blockml/controllers/gen-sql/gen-sql.service';
import { makeErrorResponseBlockml } from '~blockml/functions/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/make-ok-response-blockml';

let pathGenSql = common.RabbitBlockmlWorkerRoutingEnum.GenSql.toString();

@Injectable()
export class ConsumerWorkerService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private genSqlService: GenSqlService
  ) {}

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.BlockmlWorker.toString(),
    routingKey: pathGenSql,
    queue: pathGenSql
  })
  async genSql(request: any, context: any) {
    try {
      let payload = await this.genSqlService.gen(request);

      return makeOkResponseBlockml({
        payload: payload,
        body: request,
        path: pathGenSql,
        method: common.METHOD_RABBIT,
        cs: this.cs
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e: e,
        body: request,
        path: pathGenSql,
        method: common.METHOD_RABBIT,
        cs: this.cs
      });
    }
  }
}
