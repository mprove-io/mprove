import * as fse from 'fs-extra';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';

export async function writeSyncConfig(item: {
  repoPath: string;
  syncTime?: number;
}) {
  let syncParentPath = `${item.repoPath}/${common.MPROVE_CACHE_DIR}`;
  await fse.ensureDir(syncParentPath);

  let syncFilePath = `${syncParentPath}/${common.MPROVE_SYNC_FILENAME}`;

  let sync: interfaces.SyncConfig = {
    syncTime: item.syncTime || Date.now(),
    isFirstSync: false
  };

  let syncJson = JSON.stringify(sync, null, 2);
  await fse.writeFile(syncFilePath, syncJson);

  return sync;
}
