import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}
  async sendToBlockmlWorker<T>(item: { routingKey: string; message: any }) {
    const response = await this.amqpConnection.request<T>({
      exchange: RabbitExchangesEnum.BlockmlWorker.toString(),
      routingKey: item.routingKey,
      payload: item.message,
      timeout: 30000
    });

    return response;
  }
}
