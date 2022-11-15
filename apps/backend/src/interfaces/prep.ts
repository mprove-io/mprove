import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { RabbitService } from '~backend/services/rabbit.service';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rabbitService: RabbitService;
  logger: Logger;
  cs: ConfigService;
  loginToken: string;
}
