import { ConfigService } from '@nestjs/config';

export function isScheduler(cs: ConfigService<BackendConfig>): boolean {
  let result =
    cs.get<BackendConfig['isScheduler']>('isScheduler') === BoolEnum.TRUE;

  return result;
}
