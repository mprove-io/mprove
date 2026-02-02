'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateAllShardNames = generateAllShardNames;
var FIRST_CHAR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 26
var SECOND_CHAR_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 36
var MAX_BUCKETS = FIRST_CHAR_ALPHABET.length * SECOND_CHAR_ALPHABET.length; // 26*36 = 936;
function getPrefix(idx) {
  return (
    FIRST_CHAR_ALPHABET[Math.floor(idx / 36)] + SECOND_CHAR_ALPHABET[idx % 36]
  );
}
function generateAllShardNames() {
  var shards = [];
  var totalShardsString = process.env.BACKEND_TOTAL_DISK_SHARDS || 1;
  if (!totalShardsString) {
    throw new Error('BACKEND_TOTAL_DISK_SHARDS is not defined');
  }
  var totalShards = Number(totalShardsString);
  console.log('totalShards');
  console.log(totalShards);
  if (totalShards <= 0) {
    throw new Error('totalShards must be positive');
  } else if (totalShards > MAX_BUCKETS) {
    throw new Error('totalShards cannot be more than '.concat(MAX_BUCKETS));
  } else if (totalShards === 1) {
    shards = ['shard-0: AA-ZZ'];
  } else {
    var step = MAX_BUCKETS / totalShards;
    for (var i = 0; i < totalShards; i++) {
      var startIdx = Math.floor(i * step);
      var endIdx = Math.min(Math.floor((i + 1) * step) - 1, MAX_BUCKETS - 1);
      var start = getPrefix(startIdx);
      var end = getPrefix(endIdx);
      shards.push('shard-'.concat(i, ': ').concat(start, '-').concat(end));
    }
  }
  console.log(shards);
  return shards;
}
generateAllShardNames();
