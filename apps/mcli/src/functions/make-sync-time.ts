import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';

export async function makeSyncTime(item?: { skipDelay?: boolean }) {
  let syncTime;

  if (item?.skipDelay === true) {
    syncTime = Date.now();
  } else {
    await common.sleep(constants.POSSIBLE_TIME_DIFF_MS);
    syncTime = Date.now();
    await common.sleep(constants.POSSIBLE_TIME_DIFF_MS);
  }

  return syncTime;
}
