export function calculateDiskShard(item: {
  orgId: string;
  totalDiskShards: number;
}): string {
  let { orgId, totalDiskShards } = item;

  let diskShard = 'shard-1';

  return diskShard;
}
