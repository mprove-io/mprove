import { ConfigService } from '@nestjs/config';
import { BoolEnum } from '~common/enums/bool.enum';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';

export function isSingleOrMain(cs: ConfigService<BlockmlConfig>): boolean {
  let isSingle = cs.get<BlockmlConfig['isSingle']>('isSingle');
  let isMain = cs.get<BlockmlConfig['isMain']>('isMain');

  let result = isSingle === BoolEnum.TRUE || isMain === BoolEnum.TRUE;

  return result;
}
