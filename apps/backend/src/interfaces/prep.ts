import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabToEntService } from '~backend/services/tab-to-ent.service';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rabbitService: RabbitService;
  tabToEntService: TabToEntService;
  logger: Logger;
  cs: ConfigService;
  loginToken: string;
}
