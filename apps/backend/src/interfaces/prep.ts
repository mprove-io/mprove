import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabService } from '~backend/services/tab.service';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rabbitService: RabbitService;
  tabService: TabService;
  logger: Logger;
  cs: ConfigService;
  loginToken: string;
}
