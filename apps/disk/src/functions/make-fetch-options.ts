import fse from 'fs-extra';
import { SimpleGit, simpleGit } from 'simple-git';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';

export async function createGitInstance(item: {
  repoDir: string;
  remoteType: ProjectRemoteTypeEnum;
  keyDir: string;
  gitUrl: string;
  publicKey: string;
  privateKeyEncrypted: string;
  passPhrase: string;
}): Promise<SimpleGit> {
  let {
    repoDir,
    remoteType,
    keyDir,
    publicKey,
    privateKeyEncrypted,
    passPhrase
  } = item;

  if (remoteType === ProjectRemoteTypeEnum.GitClone) {
    let pubKeyPath = `${keyDir}/id_rsa.pub`;
    let privateKeyPath = `${keyDir}/id_rsa`;
    let askpassPath = `${keyDir}/ssh-askpass.sh`;

    await fse.writeFile(pubKeyPath, publicKey);
    await fse.writeFile(privateKeyPath, privateKeyEncrypted, { mode: 0o600 });
    await fse.chmod(privateKeyPath, 0o600);
    await fse.writeFile(askpassPath, '#!/bin/sh\necho $SSH_PASSPHRASE', {
      mode: 0o700
    });
    await fse.chmod(askpassPath, 0o700);

    let baseConfig = repoDir ? { baseDir: repoDir } : {};

    return simpleGit(baseConfig).env({
      GIT_SSH_COMMAND: `ssh -i ${privateKeyPath} -F /dev/null -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`,
      SSH_PASSPHRASE: passPhrase,
      SSH_ASKPASS: askpassPath,
      SSH_ASKPASS_REQUIRE: 'force',
      DISPLAY: '1'
    });
  }

  return repoDir ? simpleGit({ baseDir: repoDir }) : simpleGit();
}
