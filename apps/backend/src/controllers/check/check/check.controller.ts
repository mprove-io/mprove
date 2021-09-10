import { Controller, Get } from '@nestjs/common';
import { SkipJwtCheck } from '~backend/decorators/_index';

@SkipJwtCheck()
@Controller('*')
export class CheckController {
  constructor() {}

  @Get()
  async check() {
    return { message: 'Not found' };
  }
}
