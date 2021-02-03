import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';

export function isSingleOrMain(cs: ConfigService<interfaces.Config>): boolean {
  let isSingle = cs.get<interfaces.Config['isSingle']>('isSingle');
  let isMain = cs.get<interfaces.Config['isMain']>('isMain');

  let result = isSingle === api.BoolEnum.TRUE || isMain === api.BoolEnum.TRUE;

  return result;
}
