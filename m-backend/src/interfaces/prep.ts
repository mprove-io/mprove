import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { RabbitService } from '../services/rabbit.service';

export interface Prep {
  app: INestApplication;
  moduleRef: TestingModule;
  httpServer: any;
  rabbitService: RabbitService;
}
