import { Controller, Get } from '@nestjs/common';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';

@SkipJwtCheck()
@Controller('*')
export class CheckController {
  constructor() {}

  @Get()
  async check() {
    return { message: 'Not found' };
  }
}
