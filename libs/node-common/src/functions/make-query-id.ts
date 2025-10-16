import * as crypto from 'crypto';
import { QueryParentTypeEnum } from '~common/enums/query-parent-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';

export function makeQueryId(item: {
  projectId: string;
  connectionId: string;
  envId: string;
  queryParentType: QueryParentTypeEnum;
  queryParentId: string;
  sql: string;
  storeTransformedRequestString: string;
  store: FileStore;
}) {
  let {
    projectId,
    envId,
    connectionId,
    queryParentType,
    queryParentId,
    sql,
    storeTransformedRequestString,
    store
  } = item;

  let text = projectId + envId + connectionId + queryParentType;

  if (
    [QueryParentTypeEnum.Dashboard, QueryParentTypeEnum.Report].indexOf(
      queryParentType
    ) > -1
  ) {
    text = text + queryParentId;
  }

  let postText = isDefined(sql)
    ? sql
    : storeTransformedRequestString +
      store.method.toString() +
      JSON.stringify(store);

  text = text + postText;

  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
