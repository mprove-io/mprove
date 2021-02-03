import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessDashboardService } from './process-dashboard.service';

@Controller()
export class ProcessDashboardController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private processDashboardService: ProcessDashboardService
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard)
  async processDashboard(@Body() body) {
    try {
      let payload = await this.processDashboardService.process(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
