import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
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
    private genSqlService: GenSqlService,
    private logger: Logger
  ) {}

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.BlockmlWorker.toString(),
    routingKey: pathGenSql,
    queue: pathGenSql
  })
  async genSql(request: any, context: any) {
    let startTs = Date.now();
    try {
      let payload = await this.genSqlService.gen(request);

      return makeOkResponseBlockml({
        body: request,
        payload: payload,
        path: pathGenSql,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e: e,
        body: request,
        path: pathGenSql,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
