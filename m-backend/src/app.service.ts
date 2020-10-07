import { Injectable } from '@nestjs/common';
import { MessageService } from './services/message.service';

@Injectable()
export class AppService {
  constructor(private readonly messageService: MessageService) {}

  async helloDiskP0(): Promise<string> {
    const response = await this.messageService.sendToDisk({
      routingKey: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_'
    });
    return response;
  }

  async helloDiskP1(): Promise<string> {
    const response = await this.messageService.sendToDisk({
      routingKey:
        'organizations_abcdefghijklmnopqrstuvwxyz_projects_abcdefghijklm'
    });
    return response;
  }

  async helloDiskP2(): Promise<string> {
    const response = await this.messageService.sendToDisk({
      routingKey:
        'organizations_abcdefghijklmnopqrstuvwxyz_projects_nopqrstuvwxyz'
    });
    return response;
  }

  async helloBlockml(): Promise<string> {
    const response = await this.messageService.sendToBlockml({
      routingKey: 'abc'
    });
    return response;
  }
}
