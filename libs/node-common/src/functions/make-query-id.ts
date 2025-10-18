import * as crypto from 'crypto';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';

export function makeQueryId(item: {
  projectId: string;
  connectionId: string;
  envId: string;
  mconfigParentType: MconfigParentTypeEnum;
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
      MconfigParentTypeEnum.Dashboard,
      MconfigParentTypeEnum.Report,
      MconfigParentTypeEnum.ChartDialogDashboard,
      MconfigParentTypeEnum.ChartDialogReport
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
