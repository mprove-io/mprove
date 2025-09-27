import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';

@SkipJwtCheck()
@SkipThrottle()
@Controller('*')
export class CheckController {
  constructor() {}

  @Get()
  async check() {
    return { message: 'Not found' };
  }
}
