let FIRST_CHAR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 26
let SECOND_CHAR_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 36

let MAX_BUCKETS = FIRST_CHAR_ALPHABET.length * SECOND_CHAR_ALPHABET.length; // 26*36 = 936;

function getPrefix(idx: number): string {
  return (
    FIRST_CHAR_ALPHABET[Math.floor(idx / 36)] + SECOND_CHAR_ALPHABET[idx % 36]
  );
}

export function generateAllShardNames(): string[] {
  let shards: string[] = [];

  let totalShardsString = process.env.BACKEND_TOTAL_DISK_SHARDS || 1;

  if (!totalShardsString) {
    throw new Error('BACKEND_TOTAL_DISK_SHARDS is not defined');
  }

  let totalShards = Number(totalShardsString);

  console.log('totalShards');
  console.log(totalShards);

  if (totalShards <= 0) {
    throw new Error('totalShards must be positive');
  } else if (totalShards > MAX_BUCKETS) {
    throw new Error(`totalShards cannot be more than ${MAX_BUCKETS}`);
  } else if (totalShards === 1) {
    shards = ['shard-0: AA-ZZ'];
  } else {
    let step = MAX_BUCKETS / totalShards;

    for (let i = 0; i < totalShards; i++) {
      let startIdx = Math.floor(i * step);
      let endIdx = Math.min(Math.floor((i + 1) * step) - 1, MAX_BUCKETS - 1);

      let start = getPrefix(startIdx);
      let end = getPrefix(endIdx);

      shards.push(`shard-${i}: ${start}-${end}`);
    }
  }

  console.log(shards);

  return shards;
}

generateAllShardNames();
