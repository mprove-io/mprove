import * as fse from 'fs-extra';
import { MPROVE_CACHE_DIR, MPROVE_SYNC_FILENAME } from '#common/constants/top';
import { McliSyncConfig } from '#common/interfaces/mcli/mcli-sync-config';

export async function writeSyncConfig(item: {
  repoPath: string;
  syncTime: number;
}) {
  let syncParentPath = `${item.repoPath}/${MPROVE_CACHE_DIR}`;
  await fse.ensureDir(syncParentPath);

  let syncFilePath = `${syncParentPath}/${MPROVE_SYNC_FILENAME}`;

  let sync: McliSyncConfig = {
    lastSyncTime: item.syncTime
  };

  let syncJson = JSON.stringify(sync, null, 2);

  await fse.writeFile(syncFilePath, syncJson);

  return sync;
}
