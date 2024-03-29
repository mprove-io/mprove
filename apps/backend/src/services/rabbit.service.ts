import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';

@Injectable()
export class RabbitService {
  constructor(private amqpConnection: AmqpConnection) {}
  async sendToDisk<T>(item: {
    routingKey: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { routingKey, message, checkIsOk } = item;

    let response = await this.amqpConnection.request<common.MyResponse>({
      exchange: common.RabbitExchangesEnum.Disk.toString(),
      routingKey: routingKey,
      payload: message,
      timeout: 30000
    });

    if (
      checkIsOk === true &&
      response.info?.status !== common.ResponseInfoStatusEnum.Ok
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
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

    let response = await this.amqpConnection.request<common.MyResponse>({
      exchange: common.RabbitExchangesEnum.Blockml.toString(),
      routingKey: routingKey,
      payload: message,
      timeout: 30000
    });

    if (
      checkIsOk === true &&
      response.info?.status !== common.ResponseInfoStatusEnum.Ok
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ERROR_RESPONSE_FROM_BLOCKML,
        originalError: response.info?.error
      });
    }

    return (response as unknown) as T;
  }
}
