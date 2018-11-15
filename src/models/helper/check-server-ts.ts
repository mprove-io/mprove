import { enums } from '../../barrels/enums';
import { ServerError } from '../../models/server-error';

export function checkServerTs(record: any, serverTs: number) {
  if (Number(record.server_ts) !== serverTs) {
    throw new ServerError({ name: enums.otherErrorsEnum.SERVER_TS });
  }
}
