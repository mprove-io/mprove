import * as crypto from 'crypto';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';

export function makeQueryId(item: {
  projectId: string;
  connectionId: string;
  envId: string;
  mconfigParentType: MconfigParentType;
  mconfigParentId: string;
  sql: string;
  storeTransformedRequestString: string;
  store: FileStore;
}) {
  let {
    projectId,
    envId,
    connectionId,
    mconfigParentType,
    mconfigParentId,
    sql,
    storeTransformedRequestString,
    store
  } = item;

  let text = projectId + envId + connectionId + mconfigParentType;

  if (
    [
      'Dashboard',
      'Report',
      'ChartDialogDashboard',
      'ChartDialogReport'
    ].indexOf(mconfigParentType) > -1
  ) {
    text = text + mconfigParentId;
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
