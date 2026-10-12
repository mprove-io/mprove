import { Result } from '@praha/byethrow';
import { calculateDiskShardResult } from '#backend/functions/calculate-disk-shard-result/calculate-disk-shard-result';
import { ServerError } from '#common/classes/server-error/server-error';
import type { CalculateDiskShardError } from '#common/types/backend/function-errors/calculate-disk-shard-error';

export function calculateDiskShard(item: {
  shardKey: string;
  totalDiskShards: number;
}): string {
  let result: Result.Result<string, CalculateDiskShardError> =
    calculateDiskShardResult(item);

  if (Result.isFailure(result)) {
    throw new ServerError({ message: result.error.code });
  }

  let shard: string = result.value;

  return shard;
}
