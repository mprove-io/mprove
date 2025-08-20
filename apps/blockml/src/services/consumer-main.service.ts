import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { makeErrorResponseBlockml } from '~blockml/functions/extra/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/extra/make-ok-response-blockml';
import { METHOD_RABBIT } from '~common/constants/top';
import { RabbitBlockmlRoutingEnum } from '~common/enums/rabbit-blockml-routing-keys.enum';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';

let pathRebuildStruct = RabbitBlockmlRoutingEnum.RebuildStruct.toString();

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<BlockmlConfig>,
    private rebuildStructService: RebuildStructService,
    private logger: Logger
  ) {}

  @RabbitRPC({
    exchange: RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathRebuildStruct,
    queue: pathRebuildStruct
  })
  async rebuildStruct(request: any, context: any) {
    let startTs = Date.now();
    try {
      let payload = await this.rebuildStructService.rebuild(request);

      return makeOkResponseBlockml({
        payload: payload,
        body: request,
        path: pathRebuildStruct,
        method: METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e: e,
        body: request,
        path: pathRebuildStruct,
        method: METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
