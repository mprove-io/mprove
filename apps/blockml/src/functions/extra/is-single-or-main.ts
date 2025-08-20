import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BoolEnum } from '~common/enums/bool.enum';

export function isSingleOrMain(cs: ConfigService<BlockmlConfig>): boolean {
  let isSingle = cs.get<BlockmlConfig['isSingle']>('isSingle');
  let isMain = cs.get<BlockmlConfig['isMain']>('isMain');

  let result = isSingle === BoolEnum.TRUE || isMain === BoolEnum.TRUE;

  return result;
}
