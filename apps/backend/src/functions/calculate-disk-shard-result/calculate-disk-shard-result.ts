import { Result } from '@praha/byethrow';
import type { CalculateDiskShardResultError } from '#common/types/backend/function-errors/calculate-disk-shard-result-error';

let FIRST_CHAR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let SECOND_CHAR_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let MAX_BUCKETS = FIRST_CHAR_ALPHABET.length * SECOND_CHAR_ALPHABET.length;

export function calculateDiskShardResult(item: {
  shardKey: string;
  totalDiskShards: number;
}): Result.Result<string, CalculateDiskShardResultError> {
  let { shardKey, totalDiskShards } = item;

  if (totalDiskShards <= 0 || totalDiskShards > MAX_BUCKETS) {
    return Result.fail({ code: 'BACKEND_WRONG_TOTAL_DISK_SHARDS' });
  }

  let isFirstCharValid: boolean = FIRST_CHAR_ALPHABET.includes(shardKey[0]);

  let isSecondCharValid: boolean = SECOND_CHAR_ALPHABET.includes(shardKey[1]);

  if (!isFirstCharValid || !isSecondCharValid || totalDiskShards === 1) {
    return Result.succeed('shard-0');
  }

  let idx: number =
    FIRST_CHAR_ALPHABET.indexOf(shardKey[0]) * 36 +
    SECOND_CHAR_ALPHABET.indexOf(shardKey[1]);

  let step: number = MAX_BUCKETS / totalDiskShards;

  let shardIndex: number = Math.min(
    Math.floor(idx / step),
    totalDiskShards - 1
  );

  return Result.succeed(`shard-${shardIndex}`);
}
