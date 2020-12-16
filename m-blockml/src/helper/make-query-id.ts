import * as crypto from 'crypto';

export function makeQueryId(item: { sql: string[] }) {
  const hash = crypto
    .createHash('sha256')
    .update(item.sql.join('\n'))
    .digest('hex');

  return hash;
}
