import { ConfigService } from '@nestjs/config';
import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';

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
