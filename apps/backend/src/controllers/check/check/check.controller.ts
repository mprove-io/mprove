import { Controller, Get } from '@nestjs/common';
import { SkipJwtCheck } from '~backend/decorators/is-public.decorator';

@SkipJwtCheck()
@Controller('*')
export class CheckController {
  constructor() {}

  @Get()
  async check() {
    return { message: 'Not found' };
  }
}
