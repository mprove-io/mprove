import { api } from '~/barrels/api';
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}
  async sendToDisk<T>(item: {
    routingKey: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { routingKey, message, checkIsOk } = item;

    let response = await this.amqpConnection.request<api.Response>({
      exchange: api.RabbitExchangesEnum.MDisk.toString(),
      routingKey: routingKey,
      payload: message
    });

    if (
      checkIsOk === true &&
      response.info?.status !== api.ResponseInfoStatusEnum.Ok
    ) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_ERROR_RESPONSE_FROM_DISK,
        originalError: response.info?.error
      });
    }

    return (response as unknown) as T;
  }

  async sendToBlockml<T>(item: {
    routingKey: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { routingKey, message, checkIsOk } = item;

    let response = await this.amqpConnection.request<api.Response>({
      exchange: api.RabbitExchangesEnum.MBlockml.toString(),
      routingKey: item.routingKey,
      payload: item.message
    });

    if (
      checkIsOk === true &&
      response.info?.status !== api.ResponseInfoStatusEnum.Ok
    ) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_ERROR_RESPONSE_FROM_BLOCKML,
        originalError: response.info?.error
      });
    }

    return (response as unknown) as T;
  }
}
