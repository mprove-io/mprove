import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { BoolEnum } from '~common/enums/bool.enum';

export function isScheduler(cs: ConfigService<BackendConfig>): boolean {
  let result =
    cs.get<BackendConfig['isScheduler']>('isScheduler') === BoolEnum.TRUE;

  return result;
}
