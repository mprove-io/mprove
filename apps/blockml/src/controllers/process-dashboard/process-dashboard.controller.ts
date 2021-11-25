import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessDashboardService } from './process-dashboard.service';

@Controller()
export class ProcessDashboardController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private processDashboardService: ProcessDashboardService
  ) {}

  @Post(apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard)
  async processDashboard(@Body() body: any) {
    try {
      let payload = await this.processDashboardService.process(body);

      return common.makeOkResponse({ payload, cs: this.cs, body: body });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, body: body });
    }
  }
}
