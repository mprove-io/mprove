import type { INestApplication, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';

export type Prep = {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rpcService: RpcService;
  tabService: TabService;
  logger: Logger;
  cs: ConfigService;
  loginToken: string;
};
