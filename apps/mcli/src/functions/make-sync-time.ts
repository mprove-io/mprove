import { common } from '~mcli/barrels/common';

export async function makeSyncTime() {
  await common.sleep(2);
  let syncTime = Date.now();
  await common.sleep(2);

  return syncTime;
}
