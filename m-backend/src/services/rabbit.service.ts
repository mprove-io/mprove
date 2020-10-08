/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@nestjs/common';

import { Nack, AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}

  async sendToDisk(item: {
    routingKey: string;
    message: any;
  }): Promise<string> {
    const response = await this.amqpConnection.request<string>({
      exchange: 'm-disk',
      routingKey: item.routingKey,
      payload: item.message
    });

    return response;
  }

  async sendToBlockml(item: {
    routingKey: string;
    message: any;
  }): Promise<string> {
    const response = await this.amqpConnection.request<string>({
      exchange: 'm-blockml',
      routingKey: item.routingKey,
      payload: item.message
    });

    return response;
  }
}
