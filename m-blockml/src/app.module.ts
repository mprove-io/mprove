import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConsumerMainService } from './services/consumer-main.service';
import { api } from './barrels/api';
import { StructService } from './services/struct.service';
import { QueryService } from './services/query.service';
import { DashboardService } from './services/dashboard.service';
import { ConsumerWorkerService } from './services/consumer-worker.service';
import { RabbitService } from './services/rabbit.service';

let providers: any[] = [];

if (
  process.env.MPROVE_BLOCKML_IS_SINGLE === 'TRUE' ||
  process.env.MPROVE_BLOCKML_IS_MAIN === 'TRUE'
) {
  providers = [
    ...providers,
    RabbitService,
    ConsumerMainService,
    DashboardService,
    QueryService,
    StructService
  ];
}

if (process.env.MPROVE_BLOCKML_IS_WORKER === 'TRUE') {
  providers = [...providers, ConsumerWorkerService];
}

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: api.RabbitExchangesEnum.MBlockml.toString(),
          type: 'direct'
        },
        {
          name: api.RabbitExchangesEnum.MBlockmlWorker.toString(),
          type: 'direct'
        }
      ],
      uri: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit:5672`
      ],
      connectionInitOptions: { wait: false }
    })
  ],
  controllers: [],
  providers: providers
})
export class AppModule {}
