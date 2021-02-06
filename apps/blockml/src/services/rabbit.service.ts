import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { common } from '~blockml/barrels/common';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}
  async sendToBlockmlWorker<T>(item: { routingKey: string; message: any }) {
    const response = await this.amqpConnection.request<T>({
      exchange: common.RabbitExchangesEnum.BlockmlWorker.toString(),
      routingKey: item.routingKey,
      payload: item.message
    });

    return response;
  }
}
