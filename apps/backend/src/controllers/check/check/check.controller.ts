import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle({
  '1s': {
    limit: 100 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 200 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 99999 * THROTTLE_MULTIPLIER
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
