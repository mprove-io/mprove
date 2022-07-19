import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessQueryService } from '~blockml/controllers/process-query/process-query.service';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';

let pathProcessQuery = common.RabbitBlockmlRoutingEnum.ProcessQuery.toString();
let pathRebuildStruct = common.RabbitBlockmlRoutingEnum.RebuildStruct.toString();

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: RebuildStructService,
    private queryService: ProcessQueryService
  ) {}

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathProcessQuery,
    queue: pathProcessQuery
  })
  async processQuery(request: any, context: any) {
    try {
      let payload = await this.queryService.process(request);

      return common.makeOkResponse({
        payload,
        body: request,
        path: pathProcessQuery,
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
        path: pathProcessQuery,
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

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathRebuildStruct,
    queue: pathRebuildStruct
  })
  async rebuildStruct(request: any, context: any) {
    try {
      let payload = await this.structService.rebuild(request);

      return common.makeOkResponse({
        payload,
        body: request,
        path: pathRebuildStruct,
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
        path: pathRebuildStruct,
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
