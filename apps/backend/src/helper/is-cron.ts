import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function isCron(cs: ConfigService<interfaces.Config>): boolean {
  let result =
    cs.get<interfaces.Config['isCron']>('isCron') === common.BoolEnum.TRUE;

  return result;
}
