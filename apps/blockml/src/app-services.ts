import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { common } from './barrels/common';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { GenSqlService } from './controllers/gen-sql/gen-sql.service';
import { ProcessQueryService } from './controllers/process-query/process-query.service';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from './services/consumer-main.service';
import { ConsumerWorkerService } from './services/consumer-worker.service';
import { RabbitService } from './services/rabbit.service';

export const appServices = [
  RabbitService,
  GenSqlService,
  {
    provide: RebuildStructService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService,
      pinoLogger: PinoLogger
    ) =>
      helper.isSingleOrMain(cs)
        ? new RebuildStructService(rabbitService, cs, pinoLogger)
        : {},
    inject: [ConfigService, RabbitService]
  },
  {
    provide: ProcessQueryService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService,
      pinoLogger: PinoLogger
    ) =>
      helper.isSingleOrMain(cs)
        ? new ProcessQueryService(rabbitService, cs, pinoLogger)
        : {},
    inject: [ConfigService, RabbitService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      structService: RebuildStructService,
      queryService: ProcessQueryService,
      pinoLogger: PinoLogger
    ) => {
      let result = helper.isSingleOrMain(cs)
        ? new ConsumerMainService(cs, structService, queryService, pinoLogger)
        : {};
      return result;
    },
    inject: [ConfigService, RebuildStructService, ProcessQueryService]
  },
  {
    provide: ConsumerWorkerService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      genSqlService: GenSqlService,
      pinoLogger: PinoLogger
    ) => {
      let isWorker = cs.get<interfaces.Config['isWorker']>('isWorker');

      return isWorker === common.BoolEnum.TRUE
        ? new ConsumerWorkerService(cs, genSqlService, pinoLogger)
        : {};
    },
    inject: [ConfigService, GenSqlService]
  }
];
