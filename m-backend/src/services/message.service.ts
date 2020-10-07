/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@nestjs/common';

import { Nack, AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class MessageService {
  constructor(private amqpConnection: AmqpConnection) {}

  public async sendToDisk(item: {
    routingKey: string;
    payload?: object;
  }): Promise<string> {
    const response = await this.amqpConnection.request<string>({
      exchange: 'm-disk',
      routingKey: item.routingKey,
      payload: item.payload
    });

    return response;
  }

  public async sendToBlockml(item: {
    routingKey: string;
    payload?: object;
  }): Promise<string> {
    const response = await this.amqpConnection.request<string>({
      exchange: 'm-blockml',
      routingKey: item.routingKey,
      payload: item.payload
    });

    return response;
  }
}
