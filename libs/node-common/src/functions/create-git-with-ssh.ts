import fse from 'fs-extra';
import { SimpleGit, simpleGit } from 'simple-git';

export async function createGitWithSsh(item: {
  repoDir: string;
  keyDir: string;
  publicKey: string;
  privateKeyEncrypted: string;
  passPhrase: string;
}): Promise<SimpleGit> {
  let pubKeyPath = `${item.keyDir}/id_rsa.pub`;
  let privateKeyPath = `${item.keyDir}/id_rsa`;
  let askpassPath = `${item.keyDir}/ssh-askpass.sh`;

  await fse.writeFile(pubKeyPath, item.publicKey);
  await fse.writeFile(privateKeyPath, item.privateKeyEncrypted, {
    mode: 0o600
  });
  await fse.writeFile(askpassPath, '#!/bin/sh\necho $SSH_PASSPHRASE', {
    mode: 0o700
  });

  return simpleGit({
    baseDir: item.repoDir
  }).env({
    GIT_SSH_COMMAND: `ssh -i ${privateKeyPath} -F /dev/null -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`,
    SSH_PASSPHRASE: item.passPhrase,
    SSH_ASKPASS: askpassPath,
    SSH_ASKPASS_REQUIRE: 'force',
    DISPLAY: '1'
  });
}
