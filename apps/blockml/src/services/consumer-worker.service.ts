import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';
import { GenSqlService } from '~blockml/controllers/gen-sql/gen-sql.service';

@Injectable()
export class ConsumerWorkerService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private genSqlService: GenSqlService
  ) {}

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.BlockmlWorker.toString(),
    routingKey: api.RabbitBlockmlWorkerRoutingEnum.GenSql.toString(),
    queue: api.RabbitBlockmlWorkerRoutingEnum.GenSql.toString()
  })
  async genSql(request: any, context: any) {
    try {
      let payload = await this.genSqlService.gen(request);

      return api.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }
}
