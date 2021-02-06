import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessDashboardService } from '~blockml/controllers/process-dashboard/process-dashboard.service';
import { ProcessQueryService } from '~blockml/controllers/process-query/process-query.service';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: RebuildStructService,
    private queryService: ProcessQueryService,
    private processDashboardService: ProcessDashboardService
  ) {}

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: common.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
    queue: common.RabbitBlockmlRoutingEnum.ProcessDashboard.toString()
  })
  async processDashboard(request: any, context: any) {
    try {
      let payload = await this.processDashboardService.process(request);

      return common.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
    queue: common.RabbitBlockmlRoutingEnum.ProcessQuery.toString()
  })
  async processQuery(request: any, context: any) {
    try {
      let payload = await this.queryService.process(request);

      return common.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
    queue: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString()
  })
  async rebuildStruct(request: any, context: any) {
    try {
      let payload = await this.structService.rebuild(request);

      return common.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }
}
