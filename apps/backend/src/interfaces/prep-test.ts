import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { RpcService } from '~backend/services/rpc.service';

export interface PrepTest {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rpcService: RpcService;
  logger: Logger;
  cs: ConfigService;
}
