import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller('*')
export class CheckController {
  constructor() {}

  @Get()
  async check() {
    return { message: 'Not found' };
  }
}
