import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { RabbitService } from 'src/services/rabbit.service';
import { api } from '../../barrels/api';

@Controller()
export class CreateOrganizationController {
  constructor(private readonly rabbitService: RabbitService) {}

  @Post('createOrganization')
  async createOrganization(@Body() body): Promise<any> {
    let message: api.CreateOrganizationRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.CreateOrganization,
        traceId: 'trace123'
      },
      payload: {
        organizationId: body.organizationId
      }
    };

    let response = await this.rabbitService.sendToDisk({
      routingKey: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_',
      message: message
    });
    return response;
  }
}
