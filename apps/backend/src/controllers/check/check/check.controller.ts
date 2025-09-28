import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle({
  '1s': {
    limit: 100 * 2
  },
  '5s': {
    limit: 200 * 2
  },
  '60s': {
    limit: 99999 * 2
  }
})
@Controller('*')
export class CheckController {
  constructor() {}

  @Get()
  async check() {
    return { message: 'Not found' };
  }
}
