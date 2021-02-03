import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
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
    exchange: api.RabbitExchangesEnum.Blockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
    queue: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString()
  })
  async processDashboard(request: any, context: any) {
    try {
      let payload = await this.processDashboardService.process(request);

      return api.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.Blockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
    queue: api.RabbitBlockmlRoutingEnum.ProcessQuery.toString()
  })
  async processQuery(request: any, context: any) {
    try {
      let payload = await this.queryService.process(request);

      return api.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.Blockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
    queue: api.RabbitBlockmlRoutingEnum.RebuildStruct.toString()
  })
  async rebuildStruct(request: any, context: any) {
    try {
      let payload = await this.structService.rebuild(request);

      return api.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }
}
