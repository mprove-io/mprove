import * as crypto from 'crypto';
import { isDefined } from '~common/functions/is-defined';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';

export function makeQueryId(item: {
  projectId: string;
  envId: string;
  connectionId: string;
  sql: string;
  storeTransformedRequestString: string;
  store: FileStore;
}) {
  let {
    projectId,
    envId,
    connectionId,
    sql,
    storeTransformedRequestString,
    store
  } = item;

  let postText = isDefined(sql)
    ? sql
    : storeTransformedRequestString +
      store.method.toString() +
      JSON.stringify(store);

  let text = projectId + envId + connectionId + postText;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
