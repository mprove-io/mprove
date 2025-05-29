import * as crypto from 'crypto';
import { common } from '~node-common/barrels/common';

export function makeQueryId(item: {
  projectId: string;
  envId: string;
  connectionId: string;
  sql: string[];
  storeTransformedRequestString: string;
  store: common.FileStore;
}) {
  let {
    projectId,
    envId,
    connectionId,
    sql,
    storeTransformedRequestString,
    store
  } = item;

  let postText = common.isDefined(sql)
    ? sql.join('\n')
    : storeTransformedRequestString +
      store.method.toString() +
      JSON.stringify(store);

  let text = projectId + envId + connectionId + postText;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
