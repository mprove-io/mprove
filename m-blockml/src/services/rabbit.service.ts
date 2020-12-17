import { api } from '../barrels/api';
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}
  async sendToBlockmlWorker<T>(item: { routingKey: string; message: any }) {
    const response = await this.amqpConnection.request<T>({
      exchange: api.RabbitExchangesEnum.MBlockmlWorker.toString(),
      routingKey: item.routingKey,
      payload: item.message
    });

    return response;
  }
}
