import { POSSIBLE_TIME_DIFF_MS } from '#common/constants/top-mcli';
import { sleep } from '#common/functions/sleep';

export async function makeSyncTime(item?: { skipDelay?: boolean }) {
  let syncTime;

  if (item?.skipDelay === true) {
    syncTime = Date.now();
  } else {
    await sleep(POSSIBLE_TIME_DIFF_MS);
    syncTime = Date.now();
    await sleep(POSSIBLE_TIME_DIFF_MS);
  }

  return syncTime;
}
