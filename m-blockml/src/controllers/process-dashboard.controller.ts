import { Body, Controller, Post } from '@nestjs/common';
import { api } from '~/barrels/api';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';
import { DashboardService } from '~/services/dashboard.service';

@Controller()
export class ProcessDashboardController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private dashboardService: DashboardService
  ) {}

  @Post(api.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard)
  async processDashboard(@Body() body) {
    try {
      let payload = await this.dashboardService.processDashboard(body);

      return api.makeOkResponse({ payload, cs: this.cs, req: body });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
