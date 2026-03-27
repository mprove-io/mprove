import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { makeIdPrefix } from '#common/functions/make-id-prefix';

export async function generateApiKeyParts() {
  let prefix = makeIdPrefix();
  let secret = crypto.randomBytes(16).toString('hex').toUpperCase();

  let salt = await bcrypt.genSalt();
  let secretHash = await bcrypt.hash(secret, salt);

  return {
    prefix: prefix,
    secret: secret,
    secretHash: secretHash,
    salt: salt
  };
}
