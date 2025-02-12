import * as crypto from 'crypto';
import { enums } from '~common/barrels/enums';
import { common } from '~node-common/barrels/common';

export function makeQueryId(item: {
  sql: string[];
  storeMethod: enums.StoreMethodEnum;
  storeUrlPath: string;
  storeBody: string;
  orgId: string;
  projectId: string;
  envId: string;
  connectionId: string;
}) {
  let {
    sql,
    storeBody,
    storeMethod,
    storeUrlPath,
    orgId,
    projectId,
    envId,
    connectionId
  } = item;

  let preText = common.isDefined(sql)
    ? sql.join('\n')
    : storeBody + storeMethod.toString() + storeUrlPath;

  let text = preText + orgId + projectId + envId + connectionId;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
