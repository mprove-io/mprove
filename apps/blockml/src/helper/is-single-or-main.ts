import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { interfaces } from '~blockml/barrels/interfaces';

export function isSingleOrMain(cs: ConfigService<interfaces.Config>): boolean {
  let blockmlIsSingle = cs.get<interfaces.Config['blockmlIsSingle']>(
    'blockmlIsSingle'
  );
  let blockmlIsMain = cs.get<interfaces.Config['blockmlIsMain']>(
    'blockmlIsMain'
  );
  let result =
    blockmlIsSingle === api.BoolEnum.TRUE ||
    blockmlIsMain === api.BoolEnum.TRUE;
  return result;
}
