import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}
  async sendToDisk<T>(item: {
    routingKey: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { routingKey, message, checkIsOk } = item;

    let response = await this.amqpConnection.request<MyResponse>({
      exchange: RabbitExchangesEnum.Disk.toString(),
      routingKey: routingKey,
      payload: message,
      timeout: 30000
    });

    if (
      checkIsOk === true &&
      response.info?.status !== ResponseInfoStatusEnum.Ok
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
        originalError: response.info?.error
      });
    }

    return response as unknown as T;
  }

  async sendToBlockml<T>(item: {
    routingKey: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { routingKey, message, checkIsOk } = item;

    let response = await this.amqpConnection.request<MyResponse>({
      exchange: RabbitExchangesEnum.Blockml.toString(),
      routingKey: routingKey,
      payload: message,
      timeout: 30000
    });

    if (
      checkIsOk === true &&
      response.info?.status !== ResponseInfoStatusEnum.Ok
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_BLOCKML,
        originalError: response.info?.error
      });
    }

    return response as unknown as T;
  }
}
