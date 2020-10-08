import { Injectable } from '@nestjs/common';
import { RabbitService } from './services/rabbit.service';

@Injectable()
export class AppService {
  constructor(private readonly rabbitService: RabbitService) {}

  async helloDiskP0(message?: any): Promise<string> {
    const response = await this.rabbitService.sendToDisk({
      routingKey: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_',
      message: message
    });
    return response;
  }

  async helloDiskP1(message?: any): Promise<string> {
    const response = await this.rabbitService.sendToDisk({
      routingKey:
        'organizations_abcdefghijklmnopqrstuvwxyz_projects_abcdefghijklm',
      message: message
    });
    return response;
  }

  async helloDiskP2(message?: any): Promise<string> {
    const response = await this.rabbitService.sendToDisk({
      routingKey:
        'organizations_abcdefghijklmnopqrstuvwxyz_projects_nopqrstuvwxyz',
      message: message
    });
    return response;
  }

  async helloBlockml(message?: any): Promise<string> {
    const response = await this.rabbitService.sendToBlockml({
      routingKey: 'abc',
      message: message
    });
    return response;
  }
}
