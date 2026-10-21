import * as crypto from 'node:crypto';
import { makePassPhrase } from '#backend/functions/create-git-key-pair/make-pass-phrase/make-pass-phrase';

export type GitKeyPair = {
  publicKeyEncrypted: string;
  privateKeyEncrypted: string;
  passPhrase: string;
};

export function createGitKeyPair(): GitKeyPair {
  let passPhrase: string = makePassPhrase();

  let keyPair: crypto.KeyPairSyncResult<string, string> =
    crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: passPhrase
      }
    });

  let gitKeyPair: GitKeyPair = {
    publicKeyEncrypted: keyPair.publicKey,
    privateKeyEncrypted: keyPair.privateKey,
    passPhrase: passPhrase
  };

  return gitKeyPair;
}
