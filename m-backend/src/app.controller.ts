import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('helloDiskP0')
  helloDiskP0(): Promise<string> {
    return this.appService.helloDiskP0();
  }

  @Post('helloDiskP1')
  helloDiskP1(): Promise<string> {
    return this.appService.helloDiskP1();
  }

  @Post('helloDiskP2')
  helloDiskP2(): Promise<string> {
    return this.appService.helloDiskP2();
  }

  @Post('helloBlockml')
  helloBlockml(): Promise<string> {
    return this.appService.helloBlockml();
  }
}
