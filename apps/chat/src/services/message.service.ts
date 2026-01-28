import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatConfig } from '#chat/config/chat-config';
import { ProcessMessageService } from '#chat/controllers/process-message/process-message.service';
import { makeErrorResponseChat } from '#chat/functions/make-error-response-chat';
import { makeOkResponseChat } from '#chat/functions/make-ok-response-chat';
import { METHOD_RPC } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToChatRequestInfoNameEnum } from '~common/enums/to/to-chat-request-info-name.enum';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class MessageService {
  constructor(
    private cs: ConfigService<ChatConfig>,
    private processMessageService: ProcessMessageService,
    private logger: Logger
  ) {}

  async processMessage(body: any) {
    let startTs = Date.now();
    try {
      let payload = await this.processSwitch(body);

      return makeOkResponseChat({
        payload: payload,
        body: body,
        path: body.info.name,
        method: METHOD_RPC,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      let { resp, wrappedError } = makeErrorResponseChat({
        e: e,
        body: body,
        path: body.info.name,
        method: METHOD_RPC,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });

      return resp;
    }
  }

  async processSwitch(request: any): Promise<any> {
    switch (request.info.name) {
      case ToChatRequestInfoNameEnum.ToChatProcessMessage:
        return await this.processMessageService.process(request);

      default:
        throw new ServerError({
          message: ErEnum.CHAT_WRONG_REQUEST_INFO_NAME
        });
    }
  }
}
