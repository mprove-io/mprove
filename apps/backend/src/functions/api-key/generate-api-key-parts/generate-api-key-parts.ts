import * as crypto from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { makeIdPrefix } from '#common/functions/make-id-prefix/make-id-prefix';

export type GenerateApiKeyPartsOutput = {
  prefix: string;
  secret: string;
  secretHash: string;
  salt: string;
};

export async function generateApiKeyParts(): Promise<GenerateApiKeyPartsOutput> {
  let prefix: string = makeIdPrefix();

  let secret: string = crypto.randomBytes(16).toString('hex').toUpperCase();

  let salt: string = await bcrypt.genSalt();

  let secretHash: string = await bcrypt.hash(secret, salt);

  let output: GenerateApiKeyPartsOutput = {
    prefix: prefix,
    secret: secret,
    secretHash: secretHash,
    salt: salt
  };

  return output;
}
