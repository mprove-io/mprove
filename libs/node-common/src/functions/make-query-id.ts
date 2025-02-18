import * as crypto from 'crypto';
import { enums } from '~common/barrels/enums';
import { common } from '~node-common/barrels/common';

export function makeQueryId(item: {
  sql: string[];
  storeStructId: string;
  storeModelId: string;
  storeMethod: enums.StoreMethodEnum;
  storeUrlPath: string;
  storeBody: string;
  orgId: string;
  projectId: string;
  envId: string;
  connectionId: string;
}) {
  let {
    orgId,
    projectId,
    envId,
    connectionId,
    sql,
    storeStructId,
    storeModelId,
    storeMethod,
    storeUrlPath,
    storeBody
  } = item;

  let preText = common.isDefined(sql)
    ? sql.join('\n')
    : storeStructId +
      storeModelId +
      storeMethod.toString() +
      storeUrlPath +
      storeBody;

  let text = preText + orgId + projectId + envId + connectionId;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
