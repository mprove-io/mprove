import * as bcrypt from 'bcrypt';

export async function validateApiKeySecret(item: {
  secret: string;
  storedHash: string;
  storedSalt: string;
}) {
  let { secret, storedHash, storedSalt } = item;

  let hash = await bcrypt.hash(secret, storedSalt);

  return hash === storedHash;
}
