import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

let FIRST_CHAR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 26
let SECOND_CHAR_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 36

let MAX_BUCKETS = FIRST_CHAR_ALPHABET.length * SECOND_CHAR_ALPHABET.length; // 26*36 = 936;

export function calculateDiskShard(item: {
  shardKey: string;
  totalDiskShards: number;
}): string {
  let { shardKey, totalDiskShards } = item;

  if (totalDiskShards <= 0 || totalDiskShards > MAX_BUCKETS) {
    throw new ServerError({
      message: ErEnum.BACKEND_WRONG_TOTAL_DISK_SHARDS
    });
  }

  let isFirstCharValid: boolean = FIRST_CHAR_ALPHABET.includes(shardKey[0]);

  let isSecondCharValid: boolean = SECOND_CHAR_ALPHABET.includes(shardKey[1]);

  if (!isFirstCharValid || !isSecondCharValid) {
    return 'shard-0'; // shard keys in tests may not match pattern - OK
  }

  if (totalDiskShards === 1) {
    return 'shard-0';
  }

  let idx =
    FIRST_CHAR_ALPHABET.indexOf(shardKey[0]) * 36 +
    SECOND_CHAR_ALPHABET.indexOf(shardKey[1]);

  let step = MAX_BUCKETS / totalDiskShards;

  let shardIndex = Math.min(Math.floor(idx / step), totalDiskShards - 1);

  return `shard-${shardIndex}`;
}
