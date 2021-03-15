import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function isScheduler(cs: ConfigService<interfaces.Config>): boolean {
  let result =
    cs.get<interfaces.Config['isScheduler']>('isScheduler') ===
    common.BoolEnum.TRUE;

  return result;
}
