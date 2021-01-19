import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
}
