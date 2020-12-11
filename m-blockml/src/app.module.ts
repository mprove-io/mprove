import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConsumerService } from './services/consumer.service';
import { api } from './barrels/api';
import { StructService } from './services/struct.service';
import { QueryService } from './services/query.service';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: api.RabbitExchangesEnum.MBlockml.toString(),
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
  providers: [ConsumerService, DashboardService, QueryService, StructService]
})
export class AppModule {}
