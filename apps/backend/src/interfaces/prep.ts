import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { RpcService } from '#backend/services/rpc.service';
import { TabToEntService } from '#backend/services/tab-to-ent.service';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rpcService: RpcService;
  tabToEntService: TabToEntService;
  logger: Logger;
  cs: ConfigService;
  loginToken: string;
}
