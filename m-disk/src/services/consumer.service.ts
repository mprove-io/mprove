import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';
import { MessageService } from './message.service';

@Injectable()
export class ConsumerService {
  constructor(private messageService: MessageService) {}

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___',
    queue: 'abcdefghijklmnopqrstuvwxyz___'
  })
  async consumer1(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___abcd',
    queue: 'abcdefghijklmnopqrstuvwxyz___abcd'
  })
  async consumer2(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___efgh',
    queue: 'abcdefghijklmnopqrstuvwxyz___efgh'
  })
  async consumer3(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___ijkl',
    queue: 'abcdefghijklmnopqrstuvwxyz___ijkl'
  })
  async consumer4(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___mnop',
    queue: 'abcdefghijklmnopqrstuvwxyz___mnop'
  })
  async consumer5(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___qrst',
    queue: 'abcdefghijklmnopqrstuvwxyz___qrst'
  })
  async consumer6(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___uvwx',
    queue: 'abcdefghijklmnopqrstuvwxyz___uvwx'
  })
  async consumer7(request: any, context: any) {
    return this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: api.RabbitExchangesEnum.MDisk.toString(),
    routingKey: 'abcdefghijklmnopqrstuvwxyz___yz',
    queue: 'abcdefghijklmnopqrstuvwxyz___yz'
  })
  async consumer8(request: any, context: any) {
    return this.messageService.processMessage(request);
  }
}
