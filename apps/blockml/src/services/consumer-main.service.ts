import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';
import { DashboardService } from './dashboard.service';
import { QueryService } from './query.service';
import { StructService } from './struct.service';

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: StructService,
    private queryService: QueryService,
    private dashboardService: DashboardService
  ) {}

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.Blockml.toString(),
    routingKey: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
    queue: api.RabbitBlockmlRoutingEnum.ProcessDashboard.toString()
  })
  async processDashboard(request: any, context: any) {
    try {
      let payload = await this.dashboardService.processDashboard(request);

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
      let payload = await this.queryService.processQuery(request);

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
      let payload = await this.structService.process(request);

      return api.makeOkResponse({ payload, cs: this.cs, req: request });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: request });
    }
  }
}
