import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

export interface Prep {
  app: INestApplication;
  moduleFixture: TestingModule;
  httpServer: any;
}
