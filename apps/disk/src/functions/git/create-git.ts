import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import type { SimpleGit } from 'simple-git';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function createGit(item: {
  repoDir: string;
  remoteType: ProjectRemoteTypeEnum;
  keyDir: string;
  gitUrl: string;
  publicKey: string;
  privateKeyEncrypted: string;
  passPhrase: string;
}): Result.ResultAsync<SimpleGit, never> {
  if (item.remoteType === ProjectRemoteTypeEnum.GitClone) {
    let pubKeyPath: string = `${item.keyDir}/id_rsa.pub`;
    let privateKeyPath: string = `${item.keyDir}/id_rsa`;
    let askpassPath: string = `${item.keyDir}/ssh-askpass.sh`;

    await fse.writeFile(pubKeyPath, item.publicKey);
    await fse.writeFile(privateKeyPath, item.privateKeyEncrypted, {
      mode: 0o600
    });
    await fse.chmod(privateKeyPath, 0o600);
    await fse.writeFile(askpassPath, '#!/bin/sh\necho $SSH_PASSPHRASE', {
      mode: 0o700
    });
    await fse.chmod(askpassPath, 0o700);

    let git: SimpleGit = createSimpleGit({ baseDir: item.repoDir }).env({
      GIT_SSH_COMMAND: `ssh -i ${privateKeyPath} -F /dev/null -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`,
      SSH_PASSPHRASE: item.passPhrase,
      SSH_ASKPASS: askpassPath,
      SSH_ASKPASS_REQUIRE: 'force',
      DISPLAY: '1'
    });

    return Result.succeed(git);
  }

  let git: SimpleGit = createSimpleGit({ baseDir: item.repoDir });

  return Result.succeed(git);
}
