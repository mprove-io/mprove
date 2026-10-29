import type { INestApplication, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import type { RpcService } from '#backend/services/rpc/rpc.service';

export type PrepTest = {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rpcService: RpcService;
  logger: Logger;
  cs: ConfigService;
};
