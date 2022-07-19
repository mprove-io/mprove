import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { GenSqlService } from '~blockml/controllers/gen-sql/gen-sql.service';

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

      return common.makeOkResponse({
        payload,
        body: request,
        path: pathGenSql,
        method: common.METHOD_RABBIT,
        logResponseOk: this.cs.get<interfaces.Config['blockmlLogResponseOk']>(
          'blockmlLogResponseOk'
        ),
        logOnResponser: this.cs.get<interfaces.Config['blockmlLogOnResponser']>(
          'blockmlLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['blockmlLogIsColor']>(
          'blockmlLogIsColor'
        )
      });
    } catch (e) {
      return common.makeErrorResponse({
        e,
        body: request,
        path: pathGenSql,
        method: common.METHOD_RABBIT,
        logResponseError: this.cs.get<
          interfaces.Config['blockmlLogResponseError']
        >('blockmlLogResponseError'),
        logOnResponser: this.cs.get<interfaces.Config['blockmlLogOnResponser']>(
          'blockmlLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['blockmlLogIsColor']>(
          'blockmlLogIsColor'
        )
      });
    }
  }
}
