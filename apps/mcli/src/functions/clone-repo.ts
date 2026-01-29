import fse from 'fs-extra';
import nodegit from 'nodegit';

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
    let fetchOptions: nodegit.FetchOptions = {
      callbacks: {
        certificateCheck: () => 0,
        credentials: function (url: any, userName: any) {
          return (nodegit as any).Credential.sshKeyNew(
            'git',
            publicKeyPath,
            privateKeyPath,
            passPhrase
          );
        }
      },
      prune: 1
    };
    let cloneOptions: nodegit.CloneOptions = {
      fetchOpts: fetchOptions
    };

    await nodegit.Clone(gitUrl, repoPath, cloneOptions);
  } else {
    await nodegit.Clone(gitUrl, repoPath);
  }
}
