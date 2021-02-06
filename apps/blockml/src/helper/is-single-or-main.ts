import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function isSingleOrMain(cs: ConfigService<interfaces.Config>): boolean {
  let isSingle = cs.get<interfaces.Config['isSingle']>('isSingle');
  let isMain = cs.get<interfaces.Config['isMain']>('isMain');

  let result =
    isSingle === common.BoolEnum.TRUE || isMain === common.BoolEnum.TRUE;

  return result;
}
