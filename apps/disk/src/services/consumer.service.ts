import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { TRIPLE_UNDERSCORE } from '~common/constants/top';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';
import { MessageService } from './message.service';

let keyConsumerNoProject = `0${TRIPLE_UNDERSCORE}`;
let keyConsumer0 = `0${TRIPLE_UNDERSCORE}0`;
let keyConsumer1 = `0${TRIPLE_UNDERSCORE}1`;
let keyConsumer2 = `0${TRIPLE_UNDERSCORE}2`;
let keyConsumer3 = `0${TRIPLE_UNDERSCORE}3`;
let keyConsumer4 = `0${TRIPLE_UNDERSCORE}4`;
let keyConsumer5 = `0${TRIPLE_UNDERSCORE}5`;
let keyConsumer6 = `0${TRIPLE_UNDERSCORE}6`;
let keyConsumer7 = `0${TRIPLE_UNDERSCORE}7`;

@Injectable()
export class ConsumerService {
  constructor(private messageService: MessageService) {}

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumerNoProject,
    queue: keyConsumerNoProject
  })
  async consumerNoProject(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer0,
    queue: keyConsumer0
  })
  async consumer0(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer1,
    queue: keyConsumer1
  })
  async consumer1(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer2,
    queue: keyConsumer2
  })
  async consumer2(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer3,
    queue: keyConsumer3
  })
  async consumer3(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer4,
    queue: keyConsumer4
  })
  async consumer4(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer5,
    queue: keyConsumer5
  })
  async consumer5(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer6,
    queue: keyConsumer6
  })
  async consumer6(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }
  @RabbitRPC({
    exchange: RabbitExchangesEnum.Disk.toString(),
    routingKey: keyConsumer7,
    queue: keyConsumer7
  })
  async consumer7(request: any, context: any) {
    return await this.messageService.processMessage(request);
  }
}
