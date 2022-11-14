import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { RabbitService } from '~backend/services/rabbit.service';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rabbitService: RabbitService;
  pinoLogger: Logger;
  loginToken: string;
}
