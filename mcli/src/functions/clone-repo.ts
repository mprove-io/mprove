import path from 'node:path';
import fse from 'fs-extra';
import { simpleGit } from 'simple-git';

export async function cloneRepo(item: {
  repoPath: string;
  gitUrl: string;
  publicKeyPath?: string;
  privateKeyPath?: string;
  passPhrase?: string;
  withKeys?: boolean;
}) {
  let {
    repoPath,
    gitUrl,
    withKeys,
    publicKeyPath,
    privateKeyPath,
    passPhrase
  } = item;

  let parentPath = repoPath.split('/').slice(0, -1).join('/');

  await fse.ensureDir(parentPath);
  await fse.remove(repoPath);

  if (withKeys === true) {
    let keyDir = path.dirname(privateKeyPath);
    let askpassPath = `${keyDir}/ssh-askpass.sh`;

    await fse.writeFile(askpassPath, '#!/bin/sh\necho $SSH_PASSPHRASE', {
      mode: 0o700
    });
    await fse.chmod(askpassPath, 0o700);

    let git = simpleGit().env({
      GIT_SSH_COMMAND: `ssh -i ${privateKeyPath} -F /dev/null -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`,
      SSH_PASSPHRASE: passPhrase,
      SSH_ASKPASS: askpassPath,
      SSH_ASKPASS_REQUIRE: 'force',
      DISPLAY: '1'
    });

    await git.clone(gitUrl, repoPath);
  } else {
    await simpleGit().clone(gitUrl, repoPath);
  }
}
