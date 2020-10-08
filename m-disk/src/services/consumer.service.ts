import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { delay } from '../helper/delay';
import { MessageService } from './message.service';

@Injectable()
export class ConsumerService {
  constructor(private readonly messageService: MessageService) {}

  @RabbitRPC({
    exchange: 'm-disk',
    routingKey: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_',
    queue: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_'
  })
  async consumer1(request: any, context: any) {
    await delay(0);
    return this.messageService.processRequest(request);
  }

  @RabbitRPC({
    exchange: 'm-disk',
    routingKey:
      'organizations_abcdefghijklmnopqrstuvwxyz_projects_abcdefghijklm',
    queue: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_abcdefghijklm'
  })
  async consumer2(request: any, context: any) {
    await delay(1000);
    return this.messageService.processRequest(request);
  }

  @RabbitRPC({
    exchange: 'm-disk',
    routingKey:
      'organizations_abcdefghijklmnopqrstuvwxyz_projects_nopqrstuvwxyz',
    queue: 'organizations_abcdefghijklmnopqrstuvwxyz_projects_nopqrstuvwxyz'
  })
  async consumer3(request: any, context: any) {
    await delay(2000);
    return this.messageService.processRequest(request);
  }
}
